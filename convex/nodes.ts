import { v } from "convex/values"
import { CustomConvexError } from "../src/lib/errors"
import { mutation, query } from "./_generated/server"

export const getByStructureId = query({
  args: {
    structureId: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await ctx.auth.getUserIdentity()
    if (!currentUser)
      throw new CustomConvexError({
        statusCode: 401,
        message: "You must be logged in to view nodes",
      })

    const serializedId = ctx.db.normalizeId("structures", args.structureId)
    return await ctx.db
      .query("nodes")
      .filter((q) => q.eq(q.field("structureId"), serializedId))
      .collect()
  },
})

export const create = mutation({
  args: {
    x: v.number(),
    y: v.number(),
    w: v.number(),
    h: v.number(),
    label: v.string(),
    info: v.string(),
    structureId: v.string(),
    borderColour: v.string(),
    bgColour: v.string(),
  },
  handler: async (ctx, args) => {
    const serializedStructureId = ctx.db.normalizeId(
      "structures",
      args.structureId,
    )
    if (!serializedStructureId)
      throw new CustomConvexError({
        statusCode: 404,
        message: "Structure not found",
      })
    return await ctx.db.insert("nodes", {
      x: args.x,
      y: args.y,
      w: args.w,
      h: args.h,
      label: args.label,
      info: args.info,
      structureId: serializedStructureId,
      borderColour: args.borderColour,
      bgColour: args.bgColour,
    })
  },
})

export const update = mutation({
  args: {
    nodeId: v.string(),
    data: v.object({
      label: v.optional(v.string()),
      info: v.optional(v.string()),
      borderColour: v.optional(v.string()),
      bgColour: v.optional(v.string()),
      h: v.optional(v.number()),
      w: v.optional(v.number()),
      x: v.optional(v.number()),
      y: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const serializedId = ctx.db.normalizeId("nodes", args.nodeId)
    if (!serializedId)
      throw new CustomConvexError({
        statusCode: 404,
        message: "Node not found",
      })
    await ctx.db.patch(serializedId, args.data)
  },
})

export const remove = mutation({
  args: {
    nodeId: v.string(),
  },
  handler: async (ctx, args) => {
    const serializedId = ctx.db.normalizeId("nodes", args.nodeId)
    if (!serializedId)
      throw new CustomConvexError({
        statusCode: 404,
        message: "Node not found",
      })
    await ctx.db.delete(serializedId)
  },
})
