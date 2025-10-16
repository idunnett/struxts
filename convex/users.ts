import { getAuthUserId } from "@convex-dev/auth/server"
import { v } from "convex/values"
import { CustomConvexError } from "../src/lib/errors"
import { mutation, query } from "./_generated/server"

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return null

    const user = await ctx.db.get(userId)
    if (!user) return null

    return user
  },
})

export const getById = query({
  args: {
    id: v.string(),
  },
  handler: async (ctx, args) => {
    const serializedId = ctx.db.normalizeId("users", args.id)
    if (!serializedId) return null
    return await ctx.db.get(serializedId)
  },
})

export const update = mutation({
  args: {
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId)
      throw new CustomConvexError({
        message: "Unauthorized",
        statusCode: 401,
      })

    return await ctx.db.patch(userId, { name: args.name })
  },
})
