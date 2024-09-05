import { v } from "convex/values"
import { CustomConvexError } from "../src/lib/errors"
import { Id } from "./_generated/dataModel"
import { mutation, query } from "./_generated/server"

export const getById = query({
  args: {
    id: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await ctx.auth.getUserIdentity()
    if (!currentUser)
      throw new CustomConvexError({
        statusCode: 401,
        message: "You must be logged in to view structures",
      })

    const serializedId = ctx.db.normalizeId("structures", args.id)
    if (!serializedId) return null
    return await ctx.db.get(serializedId)
  },
})

export const getAllOfMyInOrgId = query({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    const currentUser = await ctx.auth.getUserIdentity()
    if (!currentUser)
      throw new CustomConvexError({
        statusCode: 401,
        message: "You must be logged in to view structures",
      })

    const orgStructureUsers = await ctx.db
      .query("orgStructureUsers")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), currentUser.subject),
          q.eq(q.field("orgId"), args.orgId),
        ),
      )
      .collect()

    const myStructures = await Promise.all(
      orgStructureUsers.map(async (s) => await ctx.db.get(s.structureId)),
    )

    return myStructures.filter((s) => s !== null)
  },
})

export const getMembers = query({
  args: { structureId: v.string() },
  handler: async (ctx, args) => {
    const serializedId = ctx.db.normalizeId("structures", args.structureId)
    if (!serializedId) return []

    const members = await ctx.db
      .query("orgStructureUsers")
      .filter((q) => q.eq(q.field("structureId"), serializedId))
      .collect()

    return members
  },
})

export const create = mutation({
  args: {
    name: v.string(),
    orgId: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await ctx.auth.getUserIdentity()
    if (!currentUser)
      throw new CustomConvexError({
        statusCode: 401,
        message: "You must be logged in to create a structure",
      })

    const newStructureId = await ctx.db.insert("structures", {
      name: args.name,
      orgId: args.orgId,
      createdById: currentUser.subject,
      updatedAt: Date.now(),
    })

    await ctx.db.insert("orgStructureUsers", {
      orgId: args.orgId,
      structureId: newStructureId,
      userId: currentUser.subject,
      role: "Owner",
    })

    return newStructureId
  },
})

export const remove = mutation({
  args: {
    structureId: v.string(),
    orgId: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await ctx.auth.getUserIdentity()
    if (!currentUser)
      throw new CustomConvexError({
        statusCode: 401,
        message: "You must be logged in to delete a structure",
      })

    const serializedId = ctx.db.normalizeId("structures", args.structureId)
    if (!serializedId)
      throw new CustomConvexError({
        statusCode: 404,
        message: "Structure not found",
      })

    const structure = await ctx.db.get(serializedId)
    if (!structure)
      throw new CustomConvexError({
        statusCode: 404,
        message: "Structure not found",
      })

    if (structure.orgId !== args.orgId)
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
          q.eq(q.field("structureId"), serializedId),
        ),
      )
      .first()
    if (currentOrgStructureUser?.role !== "Owner")
      throw new CustomConvexError({
        statusCode: 403,
        message: "You are not authorized to delete this structure",
      })

    const orgStructureUsers = await ctx.db
      .query("orgStructureUsers")
      .filter((q) => q.eq(q.field("structureId"), serializedId))
      .collect()
    await Promise.all(
      orgStructureUsers.map(async (s) => await ctx.db.delete(s._id)),
    )
    const nodes = await ctx.db
      .query("nodes")
      .filter((q) => q.eq(q.field("structureId"), serializedId))
      .collect()
    await Promise.all(nodes.map(async (n) => await ctx.db.delete(n._id)))
    const edges = await ctx.db
      .query("edges")
      .filter((q) => q.eq(q.field("structureId"), serializedId))
      .collect()
    await Promise.all(edges.map(async (e) => await ctx.db.delete(e._id)))
    const files = await ctx.db
      .query("files")
      .filter((q) => q.eq(q.field("structureId"), serializedId))
      .collect()
    await Promise.all(
      files.map(async (f) => {
        await ctx.storage.delete(f.storageId as Id<"_storage">)
        await ctx.db.delete(f._id)
      }),
    )
    const folders = await ctx.db
      .query("folders")
      .filter((q) => q.eq(q.field("structureId"), serializedId))
      .collect()
    await Promise.all(folders.map(async (f) => await ctx.db.delete(f._id)))
    await ctx.db.delete(serializedId)
  },
})

export const updateName = mutation({
  args: {
    orgId: v.string(),
    structureId: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await ctx.auth.getUserIdentity()
    if (!currentUser)
      throw new CustomConvexError({
        statusCode: 401,
        message: "You must be logged in to update a structure",
      })

    const serializedId = ctx.db.normalizeId("structures", args.structureId)
    if (!serializedId)
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
          q.eq(q.field("structureId"), serializedId),
        ),
      )
      .first()
    if (!currentOrgStructureUser)
      throw new CustomConvexError({
        statusCode: 403,
        message: "You are not authorized to update this structure",
      })

    if (currentOrgStructureUser.role !== "Owner")
      throw new CustomConvexError({
        statusCode: 403,
        message: "You are not authorized to update this structure",
      })

    await ctx.db.patch(serializedId, { name: args.name, updatedAt: Date.now() })
  },
})
