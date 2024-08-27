import { v } from "convex/values"
import { CustomConvexError } from "../src/lib/errors"
import { mutation, query } from "./_generated/server"

export const getCurrent = query({
  args: {
    orgId: v.union(v.string(), v.null()),
    structureId: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await ctx.auth.getUserIdentity()
    if (!currentUser) return null

    const orgStructureUser = await ctx.db
      .query("orgStructureUsers")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), currentUser.subject),
          q.eq(q.field("orgId"), args.orgId),
          q.eq(q.field("structureId"), args.structureId),
        ),
      )
      .first()

    return orgStructureUser
  },
})

export const updateRole = mutation({
  args: {
    orgId: v.union(v.string(), v.null()),
    structureId: v.string(),
    userId: v.string(),
    role: v.union(v.literal("Owner"), v.literal("Admin"), v.literal("Guest")),
  },
  handler: async (ctx, args) => {
    const currentUser = await ctx.auth.getUserIdentity()
    if (!currentUser) throw new CustomConvexError({ statusCode: 401 })

    const currentOrgStructureUser = await ctx.db
      .query("orgStructureUsers")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), currentUser.userId),
          q.eq(q.field("orgId"), args.orgId),
          q.eq(q.field("structureId"), args.structureId),
        ),
      )
      .first()
    if (currentOrgStructureUser?.role === "Guest")
      throw new CustomConvexError({ statusCode: 403 })

    const orgStructureUserToUpdate = await ctx.db
      .query("orgStructureUsers")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("orgId"), args.orgId),
          q.eq(q.field("structureId"), args.structureId),
        ),
      )
      .first()

    if (!orgStructureUserToUpdate)
      throw new CustomConvexError({
        statusCode: 404,
        message: "User not found in structure",
      })

    if (
      orgStructureUserToUpdate.role === "Owner" &&
      orgStructureUserToUpdate.userId !== currentUser.userId
    )
      throw new CustomConvexError({
        statusCode: 403,
        message: "Cannot change the role of an owner that is not you",
      })

    await ctx.db.patch(orgStructureUserToUpdate._id, { role: args.role })
  },
})

export const create = mutation({
  args: {
    orgId: v.string(),
    structureId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await ctx.auth.getUserIdentity()
    if (!currentUser) throw new CustomConvexError({ statusCode: 401 })

    const serializedStructureId = ctx.db.normalizeId(
      "structures",
      args.structureId,
    )
    if (!serializedStructureId) throw new CustomConvexError({ statusCode: 404 })

    const currentOrgStructureUser = await ctx.db
      .query("orgStructureUsers")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), currentUser.userId),
          q.eq(q.field("orgId"), args.orgId),
          q.eq(q.field("structureId"), serializedStructureId),
        ),
      )
      .first()
    if (currentOrgStructureUser?.role === "Guest")
      throw new CustomConvexError({ statusCode: 403 })

    const orgStructureUser = await ctx.db
      .query("orgStructureUsers")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("orgId"), args.orgId),
          q.eq(q.field("structureId"), serializedStructureId),
        ),
      )
      .first()

    if (orgStructureUser)
      throw new CustomConvexError({
        statusCode: 409,
        message: "User already exists in structure",
      })

    await ctx.db.insert("orgStructureUsers", {
      orgId: args.orgId,
      structureId: serializedStructureId,
      userId: args.userId,
      role: "Guest",
    })
  },
})

export const remove = mutation({
  args: {
    orgId: v.string(),
    structureId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await ctx.auth.getUserIdentity()
    if (!currentUser) throw new CustomConvexError({ statusCode: 401 })

    const serializedStructureId = ctx.db.normalizeId(
      "structures",
      args.structureId,
    )
    if (!serializedStructureId) throw new CustomConvexError({ statusCode: 404 })

    const currentOrgStructureUser = await ctx.db
      .query("orgStructureUsers")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), currentUser.userId),
          q.eq(q.field("orgId"), args.orgId),
          q.eq(q.field("structureId"), serializedStructureId),
        ),
      )
      .first()
    if (currentOrgStructureUser?.role === "Guest")
      throw new CustomConvexError({ statusCode: 403 })

    const orgStructureUser = await ctx.db
      .query("orgStructureUsers")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("orgId"), args.orgId),
          q.eq(q.field("structureId"), serializedStructureId),
        ),
      )
      .first()

    if (!orgStructureUser)
      throw new CustomConvexError({
        statusCode: 404,
        message: "User not found in structure",
      })

    if (orgStructureUser.role === "Owner")
      throw new CustomConvexError({
        statusCode: 403,
        message: "Cannot delete an owner from a structure",
      })

    await ctx.db.delete(orgStructureUser._id)
  },
})
