import { v } from "convex/values"
import { CustomConvexError } from "../src/lib/errors"
import { Id } from "./_generated/dataModel"
import { mutation, query, QueryCtx } from "./_generated/server"

export async function getNodeFolders(
  ctx: QueryCtx,
  args: {
    orgId: string | null
    structureId: string
    nodeId: string
  },
) {
  const currentUser = await ctx.auth.getUserIdentity()
  if (!currentUser)
    throw new CustomConvexError({
      statusCode: 401,
      message: "You must be logged in to view folders",
    })

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

  const currentOrgStructureUser = await ctx.db
    .query("orgStructureUsers")
    .filter((q) =>
      q.and(
        q.eq(q.field("userId"), currentUser.subject),
        q.eq(q.field("orgId"), args.orgId),
        q.eq(q.field("structureId"), args.structureId),
      ),
    )
    .first()
  if (!currentOrgStructureUser)
    throw new CustomConvexError({
      statusCode: 403,
      message: "You do not have permission to view folders in this structure",
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
    orgId: v.union(v.string(), v.null()),
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
    orgId: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const currentUser = await ctx.auth.getUserIdentity()
    if (!currentUser)
      throw new CustomConvexError({
        statusCode: 401,
        message: "You must be logged in to create a folder",
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

    const currentOrgStructureUser = await ctx.db
      .query("orgStructureUsers")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), currentUser.subject),
          q.eq(q.field("orgId"), args.orgId),
          q.eq(q.field("structureId"), args.structureId),
        ),
      )
      .first()
    if (!currentOrgStructureUser)
      throw new CustomConvexError({
        statusCode: 403,
        message:
          "You do not have permission to create a folder in this structure",
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
    const currentUser = await ctx.auth.getUserIdentity()
    if (!currentUser)
      throw new CustomConvexError({
        statusCode: 401,
        message: "You must be logged in to remove a folder",
      })

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

    const currentOrgStructureUser = await ctx.db
      .query("orgStructureUsers")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), currentUser.subject),
          q.eq(q.field("orgId"), folder.orgId),
          q.eq(q.field("structureId"), folder.structureId),
        ),
      )
      .first()

    if (!currentOrgStructureUser)
      throw new CustomConvexError({
        statusCode: 403,
        message: "You do not have permission to remove this folder",
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
