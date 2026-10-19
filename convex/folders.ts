import { v } from "convex/values"
import { CustomConvexError } from "../src/lib/errors"
import { Id } from "./_generated/dataModel"
import { mutation, query, QueryCtx } from "./_generated/server"
import { requireStructureMember, requireUserId } from "./lib/auth"

export async function getNodeFolders(
  ctx: QueryCtx,
  args: {
    orgId: string
    structureId: string
    nodeId: string
  },
) {
  await requireUserId(ctx)

  const serializedNodeId = ctx.db.normalizeId("nodes", args.nodeId)
  if (!serializedNodeId)
    throw new CustomConvexError({
      statusCode: 404,
      message: "Node not found",
    })

  const serializedStructureId = ctx.db.normalizeId(
    "structures",
    args.structureId,
  )
  if (!serializedStructureId)
    throw new CustomConvexError({
      statusCode: 404,
      message: "Structure not found",
    })

  await requireStructureMember(ctx, {
    orgId: args.orgId,
    structureId: serializedStructureId,
  })

  return await ctx.db
    .query("folders")
    .filter((q) =>
      q.and(
        q.eq(q.field("nodeId"), serializedNodeId),
        q.eq(q.field("structureId"), serializedStructureId),
        q.eq(q.field("orgId"), args.orgId),
      ),
    )
    .collect()
}

export const getByNode = query({
  args: {
    orgId: v.string(),
    structureId: v.string(),
    nodeId: v.string(),
  },
  handler: getNodeFolders,
})

export const create = mutation({
  args: {
    name: v.string(),
    nodeId: v.string(),
    structureId: v.string(),
    orgId: v.string(),
  },
  handler: async (ctx, args) => {
    await requireUserId(ctx)

    const serializedStructureId = ctx.db.normalizeId(
      "structures",
      args.structureId,
    )
    if (!serializedStructureId)
      throw new CustomConvexError({
        statusCode: 404,
        message: "Structure not found",
      })

    await requireStructureMember(ctx, {
      orgId: args.orgId,
      structureId: serializedStructureId,
    })

    const serializedNodeId = ctx.db.normalizeId("nodes", args.nodeId)
    if (!serializedNodeId)
      throw new CustomConvexError({
        statusCode: 404,
        message: "Node not found",
      })
    const node = await ctx.db.get(serializedNodeId)
    if (!node)
      throw new CustomConvexError({
        statusCode: 404,
        message: "Node not found",
      })
    if (node.structureId !== args.structureId)
      throw new CustomConvexError({
        statusCode: 403,
        message: "Node does not belong to this structure",
      })

    return await ctx.db.insert("folders", {
      nodeId: serializedNodeId,
      structureId: serializedStructureId,
      orgId: args.orgId,
      name: args.name,
    })
  },
})

export const deleteFolder = mutation({
  args: {
    folderId: v.string(),
  },
  handler: async (ctx, args) => {
    await requireUserId(ctx)

    const serializedFolderId = ctx.db.normalizeId("folders", args.folderId)
    if (!serializedFolderId)
      throw new CustomConvexError({
        statusCode: 404,
        message: "Folder not found",
      })

    const folder = await ctx.db.get(serializedFolderId)
    if (!folder)
      throw new CustomConvexError({
        statusCode: 404,
        message: "Folder not found",
      })

    await requireStructureMember(ctx, {
      orgId: folder.orgId,
      structureId: folder.structureId,
    })

    const files = await ctx.db
      .query("files")
      .filter((q) => q.eq(q.field("folderId"), serializedFolderId))
      .collect()
    await Promise.all(
      files.map(async (file) => {
        await ctx.storage.delete(file.storageId as Id<"_storage">)
        await ctx.db.delete(file._id)
      }),
    )

    await ctx.db.delete(serializedFolderId)
  },
})
