import { v } from "convex/values"
import { CustomConvexError } from "../src/lib/errors"
import { Id } from "./_generated/dataModel"
import { mutation, query, QueryCtx } from "./_generated/server"
import { requireStructureMember, requireUserId } from "./lib/auth"

export async function getNodeFiles(
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

  const structure = await ctx.db.get(serializedStructureId)
  if (!structure)
    throw new CustomConvexError({
      statusCode: 404,
      message: "Structure not found",
    })
  if (structure.orgId !== args.orgId)
    throw new CustomConvexError({
      statusCode: 403,
      message: "You do not have permission to view files in this structure",
    })

  await requireStructureMember(ctx, {
    orgId: args.orgId,
    structureId: serializedStructureId,
  })

  return await ctx.db
    .query("files")
    .filter((q) =>
      q.and(
        q.eq(q.field("orgId"), args.orgId),
        q.eq(q.field("nodeId"), serializedNodeId),
        q.eq(q.field("structureId"), serializedStructureId),
      ),
    )
    .collect()
}

export const getByNode = query({
  args: {
    orgId: v.string(),
    nodeId: v.string(),
    structureId: v.string(),
  },
  handler: getNodeFiles,
})

export const getNodeFileByStorageId = query({
  args: {
    storageId: v.string(),
  },
  handler: async (ctx, args) => {
    await requireUserId(ctx)

    const file = await ctx.db
      .query("files")
      .filter((q) => q.eq(q.field("storageId"), args.storageId))
      .first()
    if (!file)
      throw new CustomConvexError({
        statusCode: 404,
        message: "File not found",
      })

    await requireStructureMember(ctx, {
      orgId: file.orgId,
      structureId: file.structureId,
    })

    return file
  },
})

/** Authenticated short-lived URL for downloading a file (replaces Clerk JWT → HTTP). */
export const getDownloadUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    await requireUserId(ctx)

    const file = await ctx.db
      .query("files")
      .withIndex("by_storageId", (q) => q.eq("storageId", args.storageId))
      .first()
    if (!file)
      throw new CustomConvexError({
        statusCode: 404,
        message: "File not found",
      })

    await requireStructureMember(ctx, {
      orgId: file.orgId,
      structureId: file.structureId,
    })

    const url = await ctx.storage.getUrl(file.storageId as Id<"_storage">)
    if (!url)
      throw new CustomConvexError({
        statusCode: 404,
        message: "File not found in storage",
      })
    return { url, name: file.name, type: file.type }
  },
})

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    await requireUserId(ctx)
    return await ctx.storage.generateUploadUrl()
  },
})

export const saveFiles = mutation({
  args: {
    files: v.array(
      v.object({
        storageId: v.string(),
        nodeId: v.string(),
        structureId: v.string(),
        orgId: v.string(),
        name: v.string(),
        size: v.number(),
        type: v.string(),
        folderId: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    await requireUserId(ctx)

    const promises: Promise<Id<"files">>[] = []
    for (const {
      storageId,
      nodeId,
      orgId,
      structureId,
      name,
      size,
      type,
      folderId,
    } of args.files) {
      const serializedNodeId = ctx.db.normalizeId("nodes", nodeId)
      if (!serializedNodeId)
        throw new CustomConvexError({
          statusCode: 404,
          message: "Node not found",
        })
      const serializedStructureId = ctx.db.normalizeId(
        "structures",
        structureId,
      )
      if (!serializedStructureId)
        throw new CustomConvexError({
          statusCode: 404,
          message: "Structure not found",
        })
      const serializedFolderId = ctx.db.normalizeId("folders", folderId)
      if (!serializedFolderId)
        throw new CustomConvexError({
          statusCode: 404,
          message: "Folder not found",
        })
      await requireStructureMember(ctx, {
        orgId,
        structureId: serializedStructureId,
      })
      promises.push(
        ctx.db.insert("files", {
          storageId,
          orgId,
          nodeId: serializedNodeId,
          structureId: serializedStructureId,
          name,
          size,
          type,
          folderId: serializedFolderId,
        }),
      )
    }
    await Promise.all(promises)
  },
})

export const deleteFile = mutation({
  args: {
    storageId: v.string(),
  },
  handler: async (ctx, args) => {
    await requireUserId(ctx)

    const file = await ctx.db
      .query("files")
      .filter((q) => q.eq(q.field("storageId"), args.storageId))
      .first()
    if (!file)
      throw new CustomConvexError({
        statusCode: 404,
        message: "File not found",
      })

    await requireStructureMember(ctx, {
      orgId: file.orgId,
      structureId: file.structureId,
    })

    await ctx.storage.delete(file.storageId as Id<"_storage">)
    await ctx.db.delete(file._id)
  },
})
