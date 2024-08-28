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
        message: "You must be logged in to view edges",
      })

    const serializedId = ctx.db.normalizeId("structures", args.structureId)
    return await ctx.db
      .query("edges")
      .filter((q) => q.eq(q.field("structureId"), serializedId))
      .collect()
  },
})

export const create = mutation({
  args: {
    source: v.string(),
    target: v.string(),
    colour: v.string(),
    structureId: v.string(),
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
    const serializedSourceNodeId = ctx.db.normalizeId("nodes", args.source)
    if (!serializedSourceNodeId)
      throw new CustomConvexError({
        statusCode: 404,
        message: "Source node not found",
      })
    const serializedTargetNodeId = ctx.db.normalizeId("nodes", args.target)
    if (!serializedTargetNodeId)
      throw new CustomConvexError({
        statusCode: 404,
        message: "Target node not found",
      })

    const existingEdge = await ctx.db
      .query("edges")
      .filter((q) =>
        q.and(
          q.eq(q.field("source"), serializedSourceNodeId),
          q.eq(q.field("target"), serializedTargetNodeId),
          q.eq(q.field("structureId"), serializedStructureId),
        ),
      )
      .first()

    if (existingEdge) return existingEdge._id

    return await ctx.db.insert("edges", {
      colour: args.colour,
      source: serializedSourceNodeId,
      target: serializedTargetNodeId,
      structureId: serializedStructureId,
      labels: [],
    })
  },
})

export const update = mutation({
  args: {
    edgeId: v.string(),
    data: v.object({
      colour: v.optional(v.string()),
      labels: v.optional(
        v.array(v.object({ label: v.string(), offset: v.number() })),
      ),
    }),
  },
  handler: async (ctx, args) => {
    const serializedId = ctx.db.normalizeId("edges", args.edgeId)
    if (!serializedId)
      throw new CustomConvexError({
        statusCode: 404,
        message: "Edge not found",
      })
    await ctx.db.patch(serializedId, args.data)
  },
})

export const remove = mutation({
  args: {
    edgeId: v.string(),
  },
  handler: async (ctx, args) => {
    const serializedId = ctx.db.normalizeId("edges", args.edgeId)
    if (!serializedId)
      throw new CustomConvexError({
        statusCode: 404,
        message: "Edge not found",
      })
    await ctx.db.delete(serializedId)
  },
})
