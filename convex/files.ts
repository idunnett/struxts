import { v } from "convex/values"
import { CustomConvexError } from "../src/lib/errors"
import { Id } from "./_generated/dataModel"
import { mutation, query } from "./_generated/server"

export const getNodeFiles = query({
  args: {
    orgId: v.union(v.string(), v.null()),
    nodeId: v.string(),
    structureId: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await ctx.auth.getUserIdentity()
    if (!currentUser)
      throw new CustomConvexError({
        statusCode: 401,
        message: "You must be logged in to view files",
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

    const orgStructureUser = await ctx.db
      .query("orgStructureUsers")
      .filter((q) =>
        q.and(
          q.eq(q.field("orgId"), args.orgId),
          q.eq(q.field("userId"), currentUser.subject),
          q.eq(q.field("structureId"), serializedStructureId),
        ),
      )
      .first()
    if (!orgStructureUser)
      throw new CustomConvexError({
        statusCode: 403,
        message: "You do not have permission to view files in this structure",
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
  },
})

export const getNodeFileByStorageId = query({
  args: {
    storageId: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("getNodeFileByStorageId")
    const currentUser = await ctx.auth.getUserIdentity()
    if (!currentUser)
      throw new CustomConvexError({
        statusCode: 401,
        message: "You must be logged in to view files",
      })

    const file = await ctx.db
      .query("files")
      .filter((q) => q.eq(q.field("storageId"), args.storageId))
      .first()
    if (!file)
      throw new CustomConvexError({
        statusCode: 404,
        message: "File not found",
      })

    const structureId = ctx.db.normalizeId("structures", file.structureId)
    if (!structureId)
      throw new CustomConvexError({
        statusCode: 404,
        message: "Structure not found",
      })
    const orgId = file.orgId

    const orgStructureUser = await ctx.db
      .query("orgStructureUsers")
      .filter((q) =>
        q.and(
          q.eq(q.field("orgId"), orgId),
          q.eq(q.field("userId"), currentUser.subject),
          q.eq(q.field("structureId"), structureId),
        ),
      )
      .first()

    if (!orgStructureUser)
      throw new CustomConvexError({
        statusCode: 403,
        message: "You do not have permission to view files in this structure",
      })

    return file
  },
})

export const generateUploadUrl = mutation({
  args: {
    // ...
  },
  handler: async (ctx, args) => {
    const currentUser = await ctx.auth.getUserIdentity()
    if (!currentUser)
      throw new CustomConvexError({
        statusCode: 401,
        message: "You must be logged in to upload files",
      })

    // Return an upload URL
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
        orgId: v.union(v.string(), v.null()),
        name: v.string(),
        size: v.number(),
        type: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const currentUser = await ctx.auth.getUserIdentity()
    if (!currentUser)
      throw new CustomConvexError({
        statusCode: 401,
        message: "You must be logged in to upload files",
      })

    const promises: Promise<Id<"files">>[] = []
    for (const {
      storageId,
      nodeId,
      orgId,
      structureId,
      name,
      size,
      type,
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
      promises.push(
        ctx.db.insert("files", {
          storageId,
          orgId,
          nodeId: serializedNodeId,
          structureId: serializedStructureId,
          name,
          size,
          type,
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
    const currentUser = await ctx.auth.getUserIdentity()
    if (!currentUser)
      throw new CustomConvexError({
        statusCode: 401,
        message: "You must be logged in to delete files",
      })

    const file = await ctx.db
      .query("files")
      .filter((q) => q.eq(q.field("storageId"), args.storageId))
      .first()
    if (!file)
      throw new CustomConvexError({
        statusCode: 404,
        message: "File not found",
      })

    const structureId = ctx.db.normalizeId("structures", file.structureId)
    if (!structureId)
      throw new CustomConvexError({
        statusCode: 404,
        message: "Structure not found",
      })
    const orgId = file.orgId

    const orgStructureUser = await ctx.db
      .query("orgStructureUsers")
      .filter((q) =>
        q.and(
          q.eq(q.field("orgId"), orgId),
          q.eq(q.field("userId"), currentUser.subject),
          q.eq(q.field("structureId"), structureId),
        ),
      )
      .first()

    if (!orgStructureUser)
      throw new CustomConvexError({
        statusCode: 403,
        message: "You do not have permission to delete files in this structure",
      })

    await ctx.storage.delete(file.storageId)
    await ctx.db.delete(file._id)
  },
})
