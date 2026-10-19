import { getAuthUserId } from "@convex-dev/auth/server"
import { v } from "convex/values"
import { CustomConvexError } from "../src/lib/errors"
import { mutation, query } from "./_generated/server"
import { requireUserId } from "./lib/auth"

const MAX_AVATAR_BYTES = 5 * 1024 * 1024
const ALLOWED_AVATAR_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
])

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return null
    const user = await ctx.db.get(userId)
    if (!user) return null

    let image = user.image
    if (user.imageStorageId) {
      const url = await ctx.storage.getUrl(user.imageStorageId)
      if (url) image = url
    }

    let activeOrganization = null
    if (user.activeOrganizationId) {
      const org = await ctx.db.get(user.activeOrganizationId)
      if (org) {
        const membership = await ctx.db
          .query("orgMembers")
          .withIndex("by_org_user", (q) =>
            q.eq("orgId", org._id).eq("userId", userId),
          )
          .unique()
        if (membership)
          activeOrganization = { ...org, role: membership.role }
      }
    }

    return {
      ...user,
      image,
      hasCustomImage: !!user.imageStorageId,
      activeOrganization,
    }
  },
})

export const generateAvatarUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireUserId(ctx)
    return await ctx.storage.generateUploadUrl()
  },
})

export const setAvatar = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx)
    const user = await ctx.db.get(userId)
    if (!user)
      throw new CustomConvexError({
        statusCode: 404,
        message: "User not found",
      })

    const meta = await ctx.db.system.get("_storage", args.storageId)
    if (!meta)
      throw new CustomConvexError({
        statusCode: 400,
        message: "Uploaded file not found",
      })
    if (meta.contentType && !ALLOWED_AVATAR_TYPES.has(meta.contentType))
      throw new CustomConvexError({
        statusCode: 400,
        message: "Avatar must be a JPEG, PNG, WebP, or GIF image",
      })
    if (meta.size > MAX_AVATAR_BYTES)
      throw new CustomConvexError({
        statusCode: 400,
        message: "Avatar must be 5MB or smaller",
      })

    const url = await ctx.storage.getUrl(args.storageId)
    if (!url)
      throw new CustomConvexError({
        statusCode: 400,
        message: "Could not resolve uploaded image URL",
      })

    if (user.imageStorageId && user.imageStorageId !== args.storageId) {
      try {
        await ctx.storage.delete(user.imageStorageId)
      } catch {
        // Previous file may already be gone
      }
    }

    await ctx.db.patch(userId, {
      imageStorageId: args.storageId,
      image: url,
    })
    return url
  },
})

export const clearCustomAvatar = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx)
    const user = await ctx.db.get(userId)
    if (!user)
      throw new CustomConvexError({
        statusCode: 404,
        message: "User not found",
      })

    if (user.imageStorageId) {
      try {
        await ctx.storage.delete(user.imageStorageId)
      } catch {
        // ignore
      }
    }

    await ctx.db.patch(userId, {
      imageStorageId: undefined,
      image: user.oauthImage,
    })
    return user.oauthImage ?? null
  },
})

export const getPublicProfiles = query({
  args: {},
  handler: async () => {
    // Placeholder kept for API stability; use organizations.listMembers instead.
    return []
  },
})
