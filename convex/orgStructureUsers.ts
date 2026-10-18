import { v } from "convex/values"
import { CustomConvexError } from "../src/lib/errors"
import { mutation, query } from "./_generated/server"
import { getOptionalUserId, requireUserId, sameUserId } from "./lib/auth"
import { unwrapAuthSubject } from "./lib/users"

export const getCurrent = query({
  args: {
    orgId: v.string(),
    structureId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getOptionalUserId(ctx)
    if (!userId) return null

    const serializedStructureId = ctx.db.normalizeId(
      "structures",
      args.structureId,
    )
    if (!serializedStructureId) return null

    const memberships = await ctx.db
      .query("orgStructureUsers")
      .withIndex("by_structure", (q) =>
        q.eq("structureId", serializedStructureId),
      )
      .collect()

    return (
      memberships.find(
        (m) => sameUserId(m.userId, userId) && m.orgId === args.orgId,
      ) ?? null
    )
  },
})

export const updateRole = mutation({
  args: {
    orgId: v.string(),
    structureId: v.string(),
    userId: v.string(),
    role: v.union(v.literal("Owner"), v.literal("Admin"), v.literal("Guest")),
  },
  handler: async (ctx, args) => {
    const actorId = await requireUserId(ctx)
    const targetUserId = unwrapAuthSubject(args.userId)

    const serializedStructureId = ctx.db.normalizeId(
      "structures",
      args.structureId,
    )
    if (!serializedStructureId)
      throw new CustomConvexError({
        statusCode: 404,
        message: "Structure not found",
      })

    const memberships = await ctx.db
      .query("orgStructureUsers")
      .withIndex("by_structure", (q) =>
        q.eq("structureId", serializedStructureId),
      )
      .collect()

    const currentOrgStructureUser = memberships.find(
      (m) => sameUserId(m.userId, actorId) && m.orgId === args.orgId,
    )
    if (!currentOrgStructureUser || currentOrgStructureUser.role === "Guest")
      throw new CustomConvexError({ statusCode: 403, message: "Forbidden" })

    const orgStructureUserToUpdate = memberships.find(
      (m) => sameUserId(m.userId, targetUserId) && m.orgId === args.orgId,
    )

    if (!orgStructureUserToUpdate)
      throw new CustomConvexError({
        statusCode: 404,
        message: "User not found in structure",
      })

    if (
      orgStructureUserToUpdate.role === "Owner" &&
      !sameUserId(orgStructureUserToUpdate.userId, actorId)
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
    orgId: v.string(),
    structureId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const actorId = await requireUserId(ctx)
    const targetUserId = unwrapAuthSubject(args.userId)

    const serializedStructureId = ctx.db.normalizeId(
      "structures",
      args.structureId,
    )
    if (!serializedStructureId)
      throw new CustomConvexError({
        statusCode: 404,
        message: "Structure not found",
      })

    const memberships = await ctx.db
      .query("orgStructureUsers")
      .withIndex("by_structure", (q) =>
        q.eq("structureId", serializedStructureId),
      )
      .collect()

    const currentOrgStructureUser = memberships.find(
      (m) => sameUserId(m.userId, actorId) && m.orgId === args.orgId,
    )
    if (!currentOrgStructureUser || currentOrgStructureUser.role === "Guest")
      throw new CustomConvexError({ statusCode: 403, message: "Forbidden" })

    const orgStructureUser = memberships.find(
      (m) => sameUserId(m.userId, targetUserId) && m.orgId === args.orgId,
    )

    if (orgStructureUser)
      throw new CustomConvexError({
        statusCode: 409,
        message: "User already exists in structure",
      })

    await ctx.db.insert("orgStructureUsers", {
      orgId: args.orgId,
      structureId: serializedStructureId,
      userId: targetUserId,
      role: "Guest",
    })
  },
})

export const remove = mutation({
  args: {
    orgId: v.string(),
    structureId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const actorId = await requireUserId(ctx)
    const targetUserId = unwrapAuthSubject(args.userId)

    const serializedStructureId = ctx.db.normalizeId(
      "structures",
      args.structureId,
    )
    if (!serializedStructureId)
      throw new CustomConvexError({
        statusCode: 404,
        message: "Structure not found",
      })

    const memberships = await ctx.db
      .query("orgStructureUsers")
      .withIndex("by_structure", (q) =>
        q.eq("structureId", serializedStructureId),
      )
      .collect()

    const currentOrgStructureUser = memberships.find(
      (m) => sameUserId(m.userId, actorId) && m.orgId === args.orgId,
    )
    if (!currentOrgStructureUser || currentOrgStructureUser.role === "Guest")
      throw new CustomConvexError({ statusCode: 403, message: "Forbidden" })

    const orgStructureUser = memberships.find(
      (m) => sameUserId(m.userId, targetUserId) && m.orgId === args.orgId,
    )

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
