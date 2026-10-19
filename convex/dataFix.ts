import { mutation, query } from "./_generated/server"
import type { Id } from "./_generated/dataModel"
import { unwrapAuthSubject } from "./lib/users"

function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "org"
  )
}

/**
 * Read-only health check before mutating prod.
 *
 *   bunx convex run dataFix:status
 *   bunx convex run dataFix:status --prod
 */
export const status = query({
  args: {},
  handler: async (ctx) => {
    const structures = await ctx.db.query("structures").collect()
    const memberships = await ctx.db.query("orgStructureUsers").collect()
    const orgs = await ctx.db.query("organizations").collect()
    const users = await ctx.db.query("users").collect()

    const structuresMissingOrgId = structures.filter((s) => !s.orgId).length
    const structuresMissingCreatedBy = structures.filter(
      (s) => !s.createdById && !s.ownerId,
    ).length
    const structuresWithClerkOrgId = structures.filter((s) =>
      s.orgId?.startsWith("org_"),
    ).length
    const structuresWithLegacyOwnerId = structures.filter(
      (s) => !!s.ownerId && !s.createdById,
    ).length

    const membershipsMissingOrgId = memberships.filter((m) => !m.orgId).length
    const membershipsWithClerkUserId = memberships.filter((m) =>
      m.userId.startsWith("user_"),
    ).length
    const membershipsWithClerkOrgId = memberships.filter((m) =>
      m.orgId?.startsWith("org_"),
    ).length

    const usersWithLegacyClerkId = users.filter(
      (u) => !!u.legacyClerkUserId,
    ).length
    const usersWithEmail = users.filter((u) => !!u.email).length
    const orgsWithLegacyClerkId = orgs.filter(
      (o) => !!o.legacyClerkOrgId,
    ).length

    const needsClerkImport =
      structuresWithClerkOrgId > 0 ||
      membershipsWithClerkUserId > 0 ||
      membershipsWithClerkOrgId > 0

    const needsLegacyBackfill =
      structuresMissingOrgId > 0 ||
      membershipsMissingOrgId > 0 ||
      structuresMissingCreatedBy > 0 ||
      structuresWithLegacyOwnerId > 0

    return {
      counts: {
        structures: structures.length,
        orgStructureUsers: memberships.length,
        organizations: orgs.length,
        users: users.length,
      },
      issues: {
        structuresMissingOrgId,
        structuresMissingCreatedBy,
        structuresWithLegacyOwnerId,
        structuresWithClerkOrgId,
        membershipsMissingOrgId,
        membershipsWithClerkUserId,
        membershipsWithClerkOrgId,
      },
      authLinkage: {
        usersWithEmail,
        usersWithLegacyClerkId,
        orgsWithLegacyClerkId,
      },
      recommendations: {
        runClerkImport: needsClerkImport,
        runLegacyBackfill: needsLegacyBackfill,
        ready:
          !needsClerkImport &&
          !needsLegacyBackfill &&
          orgs.length > 0 &&
          usersWithEmail > 0,
      },
    }
  },
})

/**
 * Normalize legacy docs so they work with the org-based auth model.
 * Safe to re-run (idempotent for already-patched rows).
 *
 * Dev:  bunx convex run dataFix:backfillLegacyFields
 * Prod: bunx convex run dataFix:backfillLegacyFields --prod
 *
 * If status says runClerkImport, run migration:runFromClerk first (--prod).
 */
export const backfillLegacyFields = mutation({
  args: {},
  handler: async (ctx) => {
    let structuresPatched = 0
    let orgsCreated = 0
    let membershipsPatched = 0
    let orgMembersCreated = 0

    for (const structure of await ctx.db.query("structures").collect()) {
      const createdById = structure.createdById ?? structure.ownerId
      const patch: { orgId?: string; createdById?: string } = {}

      if (!structure.createdById && createdById)
        patch.createdById = createdById

      // Don't invent an org if orgId is still a Clerk id — Clerk import must run first
      if (structure.orgId?.startsWith("org_")) continue

      if (!structure.orgId && createdById) {
        let ownerUserId = ctx.db.normalizeId("users", createdById)
        if (!ownerUserId) {
          const byLegacy = createdById.startsWith("user_")
            ? await ctx.db
                .query("users")
                .withIndex("legacyClerkUserId", (q) =>
                  q.eq("legacyClerkUserId", createdById),
                )
                .unique()
            : null
          ownerUserId =
            byLegacy?._id ??
            (await ctx.db.insert("users", {
              legacyClerkUserId: createdById.startsWith("user_")
                ? createdById
                : undefined,
              name: `${structure.name} owner`,
            }))
        }

        let orgId: Id<"organizations"> | null = null
        const memberships = await ctx.db
          .query("orgMembers")
          .withIndex("by_user", (q) => q.eq("userId", ownerUserId))
          .collect()
        const owned = memberships.find((m) => m.role === "owner")
        if (owned) orgId = owned.orgId

        if (!orgId) {
          const baseSlug = slugify(structure.name)
          let slug = baseSlug
          let n = 0
          while (
            await ctx.db
              .query("organizations")
              .withIndex("by_slug", (q) => q.eq("slug", slug))
              .unique()
          ) {
            n++
            slug = `${baseSlug}-${n}`
          }

          orgId = await ctx.db.insert("organizations", {
            name: structure.name,
            slug,
            createdById: ownerUserId,
            maxAllowedMemberships: 5,
          })
          await ctx.db.insert("orgMembers", {
            orgId,
            userId: ownerUserId,
            role: "owner",
          })
          await ctx.db.insert("orgBillingAccounts", {
            orgId,
            stripeCustomerId: null,
            package: "free",
            status: "active",
          })
          orgsCreated++
        }

        patch.orgId = orgId
      }

      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(structure._id, patch)
        structuresPatched++
      }
    }

    for (const row of await ctx.db.query("orgStructureUsers").collect()) {
      if (row.orgId && !row.orgId.startsWith("org_")) continue
      if (row.orgId?.startsWith("org_")) continue // wait for Clerk import

      const structure = await ctx.db.get(row.structureId)
      if (!structure?.orgId || structure.orgId.startsWith("org_")) continue

      await ctx.db.patch(row._id, { orgId: structure.orgId })
      membershipsPatched++

      const orgId = ctx.db.normalizeId("organizations", structure.orgId)
      let userId = ctx.db.normalizeId("users", row.userId)
      if (!userId) {
        const byLegacy = row.userId.startsWith("user_")
          ? await ctx.db
              .query("users")
              .withIndex("legacyClerkUserId", (q) =>
                q.eq("legacyClerkUserId", row.userId),
              )
              .unique()
          : null
        userId =
          byLegacy?._id ??
          (await ctx.db.insert("users", {
            legacyClerkUserId: row.userId.startsWith("user_")
              ? row.userId
              : undefined,
          }))
      }
      if (orgId && userId) {
        const existing = await ctx.db
          .query("orgMembers")
          .withIndex("by_org_user", (q) =>
            q.eq("orgId", orgId).eq("userId", userId),
          )
          .unique()
        if (!existing) {
          await ctx.db.insert("orgMembers", {
            orgId,
            userId,
            role:
              row.role === "Owner"
                ? "owner"
                : row.role === "Admin"
                  ? "admin"
                  : "member",
          })
          orgMembersCreated++
        }
      }
    }

    return {
      structuresPatched,
      orgsCreated,
      membershipsPatched,
      orgMembersCreated,
    }
  },
})

/**
 * Rewrite membership / structure creator ids that accidentally stored
 * Convex Auth `subject` (`userId|sessionId`) instead of the user id.
 *
 *   bunx convex run dataFix:fixAuthSubjectUserIds
 */
export const fixAuthSubjectUserIds = mutation({
  args: {},
  handler: async (ctx) => {
    let membershipsPatched = 0
    let structuresPatched = 0

    for (const row of await ctx.db.query("orgStructureUsers").collect()) {
      if (!row.userId.includes("|")) continue
      const userId = unwrapAuthSubject(row.userId)
      await ctx.db.patch(row._id, { userId })
      membershipsPatched++
    }

    for (const structure of await ctx.db.query("structures").collect()) {
      if (!structure.createdById?.includes("|")) continue
      await ctx.db.patch(structure._id, {
        createdById: unwrapAuthSubject(structure.createdById),
      })
      structuresPatched++
    }

    return { membershipsPatched, structuresPatched }
  },
})

/** @deprecated Use backfillLegacyFields */
export const backfillOrgStructureOrgIds = backfillLegacyFields
