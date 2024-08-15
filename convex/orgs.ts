import { getAll } from "convex-helpers/server/relationships"
import { v } from "convex/values"
import { CustomConvexError } from "../src/lib/errors"
import { mutation, query } from "./_generated/server"

export const getAllOfMy = query({
  handler: async (ctx) => {
    const currentUser = await ctx.auth.getUserIdentity()
    if (!currentUser) return null

    const myOrgUserRecords = await ctx.db
      .query("orgUsers")
      .withIndex("by_userId", (q) => q.eq("userId", currentUser.subject))
      .collect()

    const myOrgIds = myOrgUserRecords.map((orgUser) => orgUser.organizationId)
    const myOrgs = await getAll(ctx.db, myOrgIds)

    if (!myOrgs.length) return null

    return myOrgs
  },
})

export const getById = query({
  args: {
    id: v.string(),
  },
  handler: async (ctx, { id }) => {
    const serializedOrgId = ctx.db.normalizeId("orgs", id)
    if (!serializedOrgId)
      throw new CustomConvexError({
        statusCode: 404,
        message: "Organization not found",
      })

    const org = await ctx.db.get(serializedOrgId)

    if (!org)
      throw new CustomConvexError({
        statusCode: 404,
        message: "Organization not found",
      })

    return org
  },
})

export const create = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, { name }) => {
    const currentUser = await ctx.auth.getUserIdentity()
    if (!currentUser)
      throw new CustomConvexError({
        statusCode: 401,
        message: "You must be logged in to create an organization",
      })
    const newId = await ctx.db.insert("orgs", {
      createdById: currentUser.subject,
      name,
    })

    await ctx.db.insert("orgUsers", {
      userId: currentUser.subject,
      organizationId: newId,
      role: "Owner",
    })

    return newId
  },
})
