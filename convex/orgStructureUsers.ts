import { getAuthUserId } from "@convex-dev/auth/server"
import { v } from "convex/values"
import { CustomConvexError } from "../src/lib/errors"
import { mutation, query } from "./_generated/server"

export const getCurrent = query({
  args: {
    structureId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return null

    const orgStructureUser = await ctx.db
      .query("orgStructureUsers")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), userId),
          q.eq(q.field("structureId"), args.structureId),
        ),
      )
      .first()

    return orgStructureUser
  },
})

export const updateRole = mutation({
  args: {
    structureId: v.string(),
    userId: v.string(),
    role: v.union(v.literal("Owner"), v.literal("Admin"), v.literal("Guest")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId)
      throw new CustomConvexError({ statusCode: 401, message: "Unauthorized" })

    const currentOrgStructureUser = await ctx.db
      .query("orgStructureUsers")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), userId),
          q.eq(q.field("structureId"), args.structureId),
        ),
      )
      .first()
    if (currentOrgStructureUser?.role === "Guest")
      throw new CustomConvexError({ statusCode: 403, message: "Forbidden" })

    const orgStructureUserToUpdate = await ctx.db
      .query("orgStructureUsers")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), args.userId),
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
      orgStructureUserToUpdate.userId !== userId
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
    structureId: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx)
    if (!(await getAuthUserId(ctx)))
      throw new CustomConvexError({ statusCode: 401, message: "Unauthorized" })

    const serializedStructureId = ctx.db.normalizeId(
      "structures",
      args.structureId,
    )
    if (!serializedStructureId)
      throw new CustomConvexError({
        statusCode: 404,
        message: "Structure not found",
      })

    const currentOrgStructureUser = await ctx.db
      .query("orgStructureUsers")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), currentUserId),
          q.eq(q.field("structureId"), serializedStructureId),
        ),
      )
      .first()
    if (currentOrgStructureUser?.role === "Guest")
      throw new CustomConvexError({ statusCode: 403, message: "Forbidden" })

    const orgStructureUser = await ctx.db
      .query("orgStructureUsers")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), args.userId),
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
      structureId: serializedStructureId,
      userId: args.userId,
      role: "Guest",
    })
  },
})

export const remove = mutation({
  args: {
    structureId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId)
      throw new CustomConvexError({ statusCode: 401, message: "Unauthorized" })

    const serializedStructureId = ctx.db.normalizeId(
      "structures",
      args.structureId,
    )
    if (!serializedStructureId)
      throw new CustomConvexError({
        statusCode: 404,
        message: "Structure not found",
      })

    const currentOrgStructureUser = await ctx.db
      .query("orgStructureUsers")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), userId),
          q.eq(q.field("structureId"), serializedStructureId),
        ),
      )
      .first()
    if (currentOrgStructureUser?.role === "Guest")
      throw new CustomConvexError({ statusCode: 403, message: "Forbidden" })

    const orgStructureUser = await ctx.db
      .query("orgStructureUsers")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), args.userId),
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
