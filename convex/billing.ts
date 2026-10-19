import { v } from "convex/values"
import { CustomConvexError } from "../src/lib/errors"
import { internalMutation, mutation, query } from "./_generated/server"
import { parseOrgId, requireOrgMember } from "./lib/auth"

export const getForOrg = query({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    const orgId = parseOrgId(ctx, args.orgId)
    if (!orgId) return null
    await requireOrgMember(ctx, orgId)

    return await ctx.db
      .query("orgBillingAccounts")
      .withIndex("by_orgId", (q) => q.eq("orgId", orgId))
      .unique()
  },
})

export const upsertFromStripe = internalMutation({
  args: {
    orgId: v.id("organizations"),
    stripeCustomerId: v.string(),
    package: v.union(
      v.literal("free"),
      v.literal("pro"),
      v.literal("enterprise"),
    ),
    status: v.union(v.literal("active"), v.literal("inactive")),
    stripePriceId: v.optional(v.string()),
    stripeProductId: v.optional(v.string()),
    nodesPerStructure: v.optional(v.string()),
    storage: v.optional(v.string()),
    structures: v.optional(v.string()),
    maxAllowedMemberships: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("orgBillingAccounts")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .unique()

    const billing = {
      orgId: args.orgId,
      stripeCustomerId: args.stripeCustomerId,
      package: args.package,
      status: args.status,
      stripePriceId: args.stripePriceId,
      stripeProductId: args.stripeProductId,
      nodesPerStructure: args.nodesPerStructure,
      storage: args.storage,
      structures: args.structures,
    }

    if (existing) await ctx.db.patch(existing._id, billing)
    else await ctx.db.insert("orgBillingAccounts", billing)

    if (args.maxAllowedMemberships !== undefined)
      await ctx.db.patch(args.orgId, {
        maxAllowedMemberships: args.maxAllowedMemberships,
      })
  },
})

export const clearSubscription = internalMutation({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("orgBillingAccounts")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .unique()
    if (!existing) return
    await ctx.db.patch(existing._id, {
      package: "free",
      status: "active",
      stripePriceId: undefined,
      stripeProductId: undefined,
      nodesPerStructure: undefined,
      storage: undefined,
      structures: undefined,
    })
  },
})

/** Ensure a Stripe customer id is stored for an org (called from server actions). */
export const setStripeCustomerId = mutation({
  args: {
    orgId: v.string(),
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, args) => {
    const orgId = parseOrgId(ctx, args.orgId)
    if (!orgId)
      throw new CustomConvexError({
        statusCode: 404,
        message: "Organization not found",
      })
    await requireOrgMember(ctx, orgId, ["owner", "admin"])

    const existing = await ctx.db
      .query("orgBillingAccounts")
      .withIndex("by_orgId", (q) => q.eq("orgId", orgId))
      .unique()
    if (existing) {
      if (
        existing.stripeCustomerId &&
        existing.stripeCustomerId !== args.stripeCustomerId
      )
        throw new CustomConvexError({
          statusCode: 409,
          message: "Organization already has a Stripe customer",
        })
      await ctx.db.patch(existing._id, {
        stripeCustomerId: args.stripeCustomerId,
      })
    } else {
      await ctx.db.insert("orgBillingAccounts", {
        orgId,
        stripeCustomerId: args.stripeCustomerId,
        package: "free",
        status: "active",
      })
    }
  },
})
