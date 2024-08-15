import { v } from "convex/values"
import { query } from "./_generated/server"

export const getCurrentOrgUser = query({
  args: {
    orgId: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.orgId) return null

    const currentUser = await ctx.auth.getUserIdentity()
    if (!currentUser) return null

    return currentUser
  },
})

export const getCurrentOrgStructureUser = query({
  args: {
    orgId: v.string(),
    structureId: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.orgId || !args.structureId) return null

    const currentUser = await ctx.auth.getUserIdentity()
    if (!currentUser) return null

    return currentUser
    // if (!currentUser) return null
  },
})
