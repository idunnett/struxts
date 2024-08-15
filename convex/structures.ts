import { getAll } from "convex-helpers/server/relationships"
import { v } from "convex/values"
import { CustomConvexError } from "../src/lib/errors"
import { query } from "./_generated/server"

export const getById = query({
  args: {
    id: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.id) return null
    const serializedId = ctx.db.normalizeId("structures", args.id)
    if (!serializedId) return null
    return await ctx.db.get(serializedId)
  },
})

export const getAllOfMyInOrgId = query({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    const currentUser = await ctx.auth.getUserIdentity()
    if (!currentUser)
      throw new CustomConvexError({
        statusCode: 401,
        message: "You must be logged in to view structures",
      })

    const serializedOrgId = ctx.db.normalizeId("orgs", args.orgId)
    if (!serializedOrgId)
      throw new CustomConvexError({
        statusCode: 404,
        message: "Organization not found",
      })

    console.log("currentUser", currentUser.subject)
    const orgUser = await ctx.db
      .query("orgUsers")
      .filter(
        (q) =>
          // q.and(
          q.eq("userId", currentUser.subject),
        // q.eq("organizationId", args.orgId),
        // ),
      )
      .first()

    if (!orgUser)
      throw new CustomConvexError({
        statusCode: 404,
        message: "You are not a member of this organization",
      })

    const orgUserStructures = await ctx.db
      .query("orgUserStructures")
      .filter((q) => q.eq("orgUserId", orgUser._id as string))
      .collect()

    const myStructures = await getAll(
      ctx.db,
      orgUserStructures.map((s) => s.structureId),
    )

    return myStructures
  },
})
