import { v } from "convex/values"
import { CustomConvexError } from "../src/lib/errors"
import { Id } from "./_generated/dataModel"
import { mutation, query } from "./_generated/server"
import { getNodeFiles } from "./files"
import { getNodeFolders } from "./folders"

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
    orgId: v.string(),
    nodeId: v.string(),
    structureId: v.string(),
  },
  handler: async (ctx, args) => {
    const serializedId = ctx.db.normalizeId("nodes", args.nodeId)
    if (!serializedId)
      throw new CustomConvexError({
        statusCode: 404,
        message: "Node not found",
      })

    const edges = await ctx.db
      .query("edges")
      .filter((q) =>
        q.or(
          q.eq(q.field("source"), serializedId),
          q.eq(q.field("target"), serializedId),
        ),
      )
      .collect()

    const files = await getNodeFiles(ctx, args)
    await Promise.all(
      files.map(async (file) => {
        await ctx.storage.delete(file.storageId as Id<"_storage">)
        await ctx.db.delete(file._id)
      }),
    )

    const folders = await getNodeFolders(ctx, args)
    await Promise.all(
      folders.map(async (folder) => {
        await ctx.db.delete(folder._id)
      }),
    )

    await Promise.all(edges.map(async (edge) => await ctx.db.delete(edge._id)))
    await ctx.db.delete(serializedId)
  },
})
