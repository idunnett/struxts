import { getAuthUserId } from "@convex-dev/auth/server"
import { v } from "convex/values"
import { query } from "./_generated/server"

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
