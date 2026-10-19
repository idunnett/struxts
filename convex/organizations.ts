import { v } from "convex/values"
import { CustomConvexError } from "../src/lib/errors"
import { getAuthUserId } from "@convex-dev/auth/server"
import { mutation, query, type MutationCtx } from "./_generated/server"
import {
  getOrgMembership,
  parseOrgId,
  requireOrgMember,
  requireUserId,
} from "./lib/auth"
import { toPublicProfile } from "./lib/users"

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48)
}

async function uniqueSlug(
  ctx: { db: MutationCtx["db"] },
  base: string,
) {
  let slug = base || "org"
  let n = 0
  while (true) {
    const candidate = n === 0 ? slug : `${slug}-${n}`
    const existing = await ctx.db
      .query("organizations")
      .withIndex("by_slug", (q) => q.eq("slug", candidate))
      .unique()
    if (!existing) return candidate
    n++
  }
}

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return null

    const org = await ctx.db
      .query("organizations")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique()
    if (!org) return null

    const membership = await ctx.db
      .query("orgMembers")
      .withIndex("by_org_user", (q) =>
        q.eq("orgId", org._id).eq("userId", userId),
      )
      .unique()
    if (!membership) return null

    return { ...org, role: membership.role }
  },
})

export const getById = query({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return null
    const orgId = parseOrgId(ctx, args.orgId)
    if (!orgId) return null
    const org = await ctx.db.get(orgId)
    if (!org) return null
    const membership = await ctx.db
      .query("orgMembers")
      .withIndex("by_org_user", (q) =>
        q.eq("orgId", org._id).eq("userId", userId),
      )
      .unique()
    if (!membership) return null
    return { ...org, role: membership.role }
  },
})

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []

    const memberships = await ctx.db
      .query("orgMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect()

    const orgs = await Promise.all(
      memberships.map(async (m) => {
        const org = await ctx.db.get(m.orgId)
        if (!org) return null
        return { ...org, role: m.role }
      }),
    )
    return orgs.filter((o) => o !== null)
  },
})

export const listMembers = query({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    const orgId = parseOrgId(ctx, args.orgId)
    if (!orgId) return []
    await requireOrgMember(ctx, orgId)

    const memberships = await ctx.db
      .query("orgMembers")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .collect()

    return await Promise.all(
      memberships.map(async (m) => {
        const profile = await toPublicProfile(ctx, m.userId)
        return {
          membershipId: m._id,
          userId: m.userId,
          role: m.role,
          name: profile.fullName,
          email: profile.primaryEmailAddress,
          imageUrl: profile.imageUrl || null,
        }
      }),
    )
  },
})

export const searchMembers = query({
  args: { orgId: v.string(), query: v.string() },
  handler: async (ctx, args) => {
    const orgId = parseOrgId(ctx, args.orgId)
    if (!orgId) return []
    await requireOrgMember(ctx, orgId)

    const q = args.query.toLowerCase().trim()
    if (q.length < 2) return []

    const memberships = await ctx.db
      .query("orgMembers")
      .withIndex("by_org", (q2) => q2.eq("orgId", orgId))
      .collect()

    const results = []
    for (const m of memberships) {
      const user = await ctx.db.get(m.userId)
      if (!user) continue
      const hay = `${user.name ?? ""} ${user.email ?? ""}`.toLowerCase()
      if (!hay.includes(q)) continue
      const profile = await toPublicProfile(ctx, m.userId)
      results.push(profile)
    }
    return results
  },
})

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx)
    const name = args.name.trim()
    if (name.length < 2)
      throw new CustomConvexError({
        statusCode: 400,
        message: "Organization name is too short",
      })

    const baseSlug = slugify(args.slug?.trim() || name)
    const slug = await uniqueSlug(ctx, baseSlug)

    const orgId = await ctx.db.insert("organizations", {
      name,
      slug,
      createdById: userId,
      maxAllowedMemberships: 5,
    })

    await ctx.db.insert("orgMembers", {
      orgId,
      userId,
      role: "owner",
    })

    await ctx.db.insert("orgBillingAccounts", {
      orgId,
      stripeCustomerId: null,
      package: "free",
      status: "active",
    })

    await ctx.db.patch(userId, { activeOrganizationId: orgId })

    return { orgId, slug }
  },
})

export const update = mutation({
  args: {
    orgId: v.string(),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const orgId = parseOrgId(ctx, args.orgId)
    if (!orgId)
      throw new CustomConvexError({
        statusCode: 404,
        message: "Organization not found",
      })
    await requireOrgMember(ctx, orgId, ["owner", "admin"])

    const org = await ctx.db.get(orgId)
    if (!org)
      throw new CustomConvexError({
        statusCode: 404,
        message: "Organization not found",
      })

    const patch: { name?: string; slug?: string } = {}

    if (args.name !== undefined) {
      const name = args.name.trim()
      if (name.length < 2)
        throw new CustomConvexError({
          statusCode: 400,
          message: "Organization name is too short",
        })
      if (name.length > 80)
        throw new CustomConvexError({
          statusCode: 400,
          message: "Organization name is too long",
        })
      patch.name = name
    }

    if (args.slug !== undefined) {
      const base = slugify(args.slug)
      if (base.length < 2)
        throw new CustomConvexError({
          statusCode: 400,
          message: "Slug is too short",
        })
      if (base !== org.slug) {
        const taken = await ctx.db
          .query("organizations")
          .withIndex("by_slug", (q) => q.eq("slug", base))
          .unique()
        if (taken)
          throw new CustomConvexError({
            statusCode: 409,
            message: "That slug is already taken",
          })
        patch.slug = base
      }
    }

    if (Object.keys(patch).length > 0) await ctx.db.patch(orgId, patch)

    const updated = await ctx.db.get(orgId)
    return {
      orgId,
      name: updated!.name,
      slug: updated!.slug,
    }
  },
})

export const setActive = mutation({
  args: { orgId: v.union(v.string(), v.null()) },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx)
    if (args.orgId === null) {
      await ctx.db.patch(userId, { activeOrganizationId: undefined })
      return null
    }
    const orgId = parseOrgId(ctx, args.orgId)
    if (!orgId)
      throw new CustomConvexError({
        statusCode: 404,
        message: "Organization not found",
      })
    await requireOrgMember(ctx, orgId)
    await ctx.db.patch(userId, { activeOrganizationId: orgId })
    return orgId
  },
})

export const setActiveBySlug = mutation({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx)
    const org = await ctx.db
      .query("organizations")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique()
    // Soft no-op: URL may briefly hold a renamed slug during navigation.
    if (!org) return null
    const membership = await getOrgMembership(ctx, org._id, userId)
    if (!membership) return null
    await ctx.db.patch(userId, { activeOrganizationId: org._id })
    return org._id
  },
})

export const updateMemberRole = mutation({
  args: {
    orgId: v.string(),
    userId: v.id("users"),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
  },
  handler: async (ctx, args) => {
    const orgId = parseOrgId(ctx, args.orgId)
    if (!orgId)
      throw new CustomConvexError({
        statusCode: 404,
        message: "Organization not found",
      })
    const { userId: actorId, membership: actor } = await requireOrgMember(
      ctx,
      orgId,
      ["owner", "admin"],
    )

    if (args.role === "owner" && actor.role !== "owner")
      throw new CustomConvexError({
        statusCode: 403,
        message: "Only owners can grant ownership",
      })

    const target = await ctx.db
      .query("orgMembers")
      .withIndex("by_org_user", (q) =>
        q.eq("orgId", orgId).eq("userId", args.userId),
      )
      .unique()
    if (!target)
      throw new CustomConvexError({
        statusCode: 404,
        message: "Member not found",
      })

    if (target.role === "owner" && target.userId !== actorId)
      throw new CustomConvexError({
        statusCode: 403,
        message: "Cannot change another owner's role",
      })

    await ctx.db.patch(target._id, { role: args.role })
  },
})

export const addMember = mutation({
  args: {
    orgId: v.string(),
    email: v.string(),
    role: v.optional(
      v.union(v.literal("admin"), v.literal("member")),
    ),
  },
  handler: async (ctx, args) => {
    const orgId = parseOrgId(ctx, args.orgId)
    if (!orgId)
      throw new CustomConvexError({
        statusCode: 404,
        message: "Organization not found",
      })
    await requireOrgMember(ctx, orgId, ["owner", "admin"])

    const email = args.email.toLowerCase().trim()
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .unique()
    if (!user)
      throw new CustomConvexError({
        statusCode: 404,
        message:
          "No user with that email has signed up yet. Ask them to create an account first.",
      })

    const existing = await ctx.db
      .query("orgMembers")
      .withIndex("by_org_user", (q) =>
        q.eq("orgId", orgId).eq("userId", user._id),
      )
      .unique()
    if (existing)
      throw new CustomConvexError({
        statusCode: 409,
        message: "User is already a member",
      })

    await ctx.db.insert("orgMembers", {
      orgId,
      userId: user._id,
      role: args.role ?? "member",
    })
    return user._id
  },
})

export const removeMember = mutation({
  args: {
    orgId: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const orgId = parseOrgId(ctx, args.orgId)
    if (!orgId)
      throw new CustomConvexError({
        statusCode: 404,
        message: "Organization not found",
      })
    const { userId: actorId } = await requireOrgMember(ctx, orgId, [
      "owner",
      "admin",
    ])

    const target = await ctx.db
      .query("orgMembers")
      .withIndex("by_org_user", (q) =>
        q.eq("orgId", orgId).eq("userId", args.userId),
      )
      .unique()
    if (!target)
      throw new CustomConvexError({
        statusCode: 404,
        message: "Member not found",
      })
    if (target.role === "owner")
      throw new CustomConvexError({
        statusCode: 403,
        message: "Cannot remove an owner",
      })
    if (target.userId === actorId)
      throw new CustomConvexError({
        statusCode: 400,
        message: "Cannot remove yourself this way",
      })

    await ctx.db.delete(target._id)
  },
})
