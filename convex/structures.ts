import { getAll } from "convex-helpers/server/relationships"
import { v } from "convex/values"
import { CustomConvexError } from "../src/lib/errors"
import { mutation, query } from "./_generated/server"

export const getById = query({
  args: {
    id: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await ctx.auth.getUserIdentity()
    if (!currentUser)
      throw new CustomConvexError({
        statusCode: 401,
        message: "You must be logged in to view structures",
      })

    const serializedId = ctx.db.normalizeId("structures", args.id)
    if (!serializedId) return null
    return await ctx.db.get(serializedId)
  },
})

export const getAllOfMyInOrgId = query({
  args: { orgId: v.union(v.string(), v.null()) },
  handler: async (ctx, args) => {
    const currentUser = await ctx.auth.getUserIdentity()
    if (!currentUser)
      throw new CustomConvexError({
        statusCode: 401,
        message: "You must be logged in to view structures",
      })

    const orgStructureUsers = await ctx.db
      .query("orgStructureUsers")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), currentUser.subject),
          q.eq(q.field("orgId"), args.orgId),
        ),
      )
      .collect()

    const myStructures = await getAll(
      ctx.db,
      orgStructureUsers.map((s) => s.structureId),
    )

    return myStructures.filter((s) => s !== null)
  },
})

export const getMembers = query({
  args: { structureId: v.string() },
  handler: async (ctx, args) => {
    const serializedId = ctx.db.normalizeId("structures", args.structureId)
    if (!serializedId) return []

    const members = await ctx.db
      .query("orgStructureUsers")
      .filter((q) => q.eq(q.field("structureId"), serializedId))
      .collect()

    return members
  },
})

export const create = mutation({
  args: {
    name: v.string(),
    orgId: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const currentUser = await ctx.auth.getUserIdentity()
    if (!currentUser)
      throw new CustomConvexError({
        statusCode: 401,
        message: "You must be logged in to create a structure",
      })

    const newStructureId = await ctx.db.insert("structures", {
      name: args.name,
      orgId: args.orgId,
      createdById: currentUser.subject,
      updatedAt: Date.now(),
    })

    await ctx.db.insert("orgStructureUsers", {
      orgId: args.orgId,
      structureId: newStructureId,
      userId: currentUser.subject,
      role: "Owner",
    })

    return newStructureId
  },
})
