import { v } from "convex/values"
import { query } from "./_generated/server"

export const getCurrent = query({
  args: {
    orgId: v.union(v.string(), v.null()),
    structureId: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await ctx.auth.getUserIdentity()
    if (!currentUser) return null

    const orgStructureUser = await ctx.db
      .query("orgStructureUsers")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), currentUser.subject),
          q.eq(q.field("orgId"), args.orgId),
          q.eq(q.field("structureId"), args.structureId),
        ),
      )
      .first()

    return orgStructureUser
  },
})
