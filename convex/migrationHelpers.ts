import { v } from "convex/values"
import { internalMutation } from "./_generated/server"
import type { Id } from "./_generated/dataModel"

export const upsertMigratedUser = internalMutation({
  args: {
    legacyClerkUserId: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const byLegacy = await ctx.db
      .query("users")
      .withIndex("legacyClerkUserId", (q) =>
        q.eq("legacyClerkUserId", args.legacyClerkUserId),
      )
      .unique()
    if (byLegacy) {
      await ctx.db.patch(byLegacy._id, {
        email: args.email ?? byLegacy.email,
        name: args.name ?? byLegacy.name,
        image: args.image ?? byLegacy.image,
      })
      return byLegacy._id
    }

    if (args.email) {
      const byEmail = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", args.email!))
        .unique()
      if (byEmail) {
        await ctx.db.patch(byEmail._id, {
          legacyClerkUserId: args.legacyClerkUserId,
          name: args.name ?? byEmail.name,
          image: args.image ?? byEmail.image,
        })
        return byEmail._id
      }
    }

    return await ctx.db.insert("users", {
      legacyClerkUserId: args.legacyClerkUserId,
      email: args.email,
      name: args.name,
      image: args.image,
      emailVerificationTime: args.email ? Date.now() : undefined,
    })
  },
})

export const upsertMigratedOrg = internalMutation({
  args: {
    legacyClerkOrgId: v.string(),
    name: v.string(),
    slug: v.string(),
    imageUrl: v.optional(v.string()),
    createdById: v.id("users"),
    maxAllowedMemberships: v.optional(v.number()),
    stripeCustomerId: v.optional(v.union(v.string(), v.null())),
    package: v.optional(
      v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise")),
    ),
    stripeProductId: v.optional(v.string()),
    nodesPerStructure: v.optional(v.string()),
    storage: v.optional(v.string()),
    structures: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("organizations")
      .withIndex("legacyClerkOrgId", (q) =>
        q.eq("legacyClerkOrgId", args.legacyClerkOrgId),
      )
      .unique()

    let orgId: Id<"organizations">
    if (existing) {
      orgId = existing._id
      await ctx.db.patch(orgId, {
        name: args.name,
        slug: args.slug,
        imageUrl: args.imageUrl,
        maxAllowedMemberships: args.maxAllowedMemberships,
      })
    } else {
      let slug = args.slug
      let n = 0
      while (true) {
        const clash = await ctx.db
          .query("organizations")
          .withIndex("by_slug", (q) => q.eq("slug", slug))
          .unique()
        if (!clash) break
        n++
        slug = `${args.slug}-${n}`
      }
      orgId = await ctx.db.insert("organizations", {
        name: args.name,
        slug,
        imageUrl: args.imageUrl,
        createdById: args.createdById,
        legacyClerkOrgId: args.legacyClerkOrgId,
        maxAllowedMemberships: args.maxAllowedMemberships,
      })
    }

    const billing = await ctx.db
      .query("orgBillingAccounts")
      .withIndex("by_orgId", (q) => q.eq("orgId", orgId))
      .unique()
    const billingFields = {
      orgId,
      stripeCustomerId: args.stripeCustomerId ?? null,
      package: args.package ?? ("free" as const),
      status: "active" as const,
      stripeProductId: args.stripeProductId,
      nodesPerStructure: args.nodesPerStructure,
      storage: args.storage,
      structures: args.structures,
    }
    if (billing) await ctx.db.patch(billing._id, billingFields)
    else await ctx.db.insert("orgBillingAccounts", billingFields)

    return orgId
  },
})

export const upsertMigratedOrgMember = internalMutation({
  args: {
    orgId: v.id("organizations"),
    userId: v.id("users"),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("orgMembers")
      .withIndex("by_org_user", (q) =>
        q.eq("orgId", args.orgId).eq("userId", args.userId),
      )
      .unique()
    if (existing) {
      await ctx.db.patch(existing._id, { role: args.role })
      return existing._id
    }
    return await ctx.db.insert("orgMembers", args)
  },
})

export const remapAppData = internalMutation({
  args: {
    userMap: v.array(
      v.object({
        clerkUserId: v.string(),
        convexUserId: v.id("users"),
      }),
    ),
    orgMap: v.array(
      v.object({
        clerkOrgId: v.string(),
        convexOrgId: v.id("organizations"),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const users = new Map(
      args.userMap.map((u) => [u.clerkUserId, u.convexUserId as string]),
    )
    const orgs = new Map(
      args.orgMap.map((o) => [o.clerkOrgId, o.convexOrgId as string]),
    )

    const mapUser = (id: string | undefined) =>
      id ? (users.get(id) ?? id) : id
    const mapOrg = (id: string | undefined) => (id ? (orgs.get(id) ?? id) : id)

    let structuresPatched = 0
    let membershipsPatched = 0
    let filesPatched = 0
    let foldersPatched = 0

    for (const structure of await ctx.db.query("structures").collect()) {
      const nextOrg = mapOrg(structure.orgId ?? structure.companyId)
      const nextCreator = mapUser(structure.createdById ?? structure.ownerId)
      if (nextOrg !== structure.orgId || nextCreator !== structure.createdById) {
        await ctx.db.patch(structure._id, {
          orgId: nextOrg,
          createdById: nextCreator,
        })
        structuresPatched++
      }
    }

    for (const row of await ctx.db.query("orgStructureUsers").collect()) {
      const nextOrg = mapOrg(row.orgId)
      const nextUser = mapUser(row.userId)
      if (nextOrg !== row.orgId || nextUser !== row.userId) {
        await ctx.db.patch(row._id, { orgId: nextOrg, userId: nextUser })
        membershipsPatched++
      }
    }

    for (const file of await ctx.db.query("files").collect()) {
      const nextOrg = mapOrg(file.orgId)
      if (nextOrg !== file.orgId) {
        await ctx.db.patch(file._id, { orgId: nextOrg })
        filesPatched++
      }
    }

    for (const folder of await ctx.db.query("folders").collect()) {
      const nextOrg = mapOrg(folder.orgId)
      if (nextOrg !== folder.orgId) {
        await ctx.db.patch(folder._id, { orgId: nextOrg })
        foldersPatched++
      }
    }

    return {
      structuresPatched,
      membershipsPatched,
      filesPatched,
      foldersPatched,
    }
  },
})
