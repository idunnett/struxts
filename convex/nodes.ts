import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const getByStructureId = query({
  args: {
    structureId: v.string(),
  },
  handler: async (ctx, args) => {
    const serializedId = ctx.db.normalizeId("structures", args.structureId)
    return await ctx.db
      .query("nodes")
      .filter((q) => q.eq(q.field("structureId"), serializedId))
      .collect()
  },
})

export const createNode = mutation({
  args: {
    x: v.number(),
    y: v.number(),
    w: v.number(),
    h: v.number(),
    label: v.string(),
    info: v.string(),
    structureId: v.id("structures"),
    borderColour: v.string(),
    bgColour: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("nodes", {
      x: args.x,
      y: args.y,
      w: args.w,
      h: args.h,
      label: args.label,
      info: args.info,
      structureId: args.structureId,
      borderColour: args.borderColour,
      bgColour: args.bgColour,
    })
  },
})
