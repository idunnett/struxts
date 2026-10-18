import { getAuthUserId } from "@convex-dev/auth/server"
import { CustomConvexError } from "../../src/lib/errors"
import type { Doc, Id } from "../_generated/dataModel"
import type { MutationCtx, QueryCtx } from "../_generated/server"
import { unwrapAuthSubject } from "./users"

type Ctx = QueryCtx | MutationCtx

export async function requireUserId(ctx: Ctx): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx)
  if (!userId)
    throw new CustomConvexError({
      statusCode: 401,
      message: "You must be logged in",
    })
  return userId
}

/** Prefer this over `identity.subject` — subject is `${userId}|${sessionId}`. */
export async function getOptionalUserId(
  ctx: Ctx,
): Promise<Id<"users"> | null> {
  return await getAuthUserId(ctx)
}

/** Match stored membership userIds even if they still include `|sessionId`. */
export function sameUserId(storedUserId: string, userId: string) {
  return (
    storedUserId === userId || unwrapAuthSubject(storedUserId) === userId
  )
}

export async function requireStructureMember(
  ctx: Ctx,
  args: { orgId: string; structureId: string },
) {
  const userId = await requireUserId(ctx)
  const structureId =
    ctx.db.normalizeId("structures", args.structureId) ??
    (args.structureId as Id<"structures">)

  const memberships = await ctx.db
    .query("orgStructureUsers")
    .withIndex("by_structure", (q) => q.eq("structureId", structureId))
    .collect()

  const membership = memberships.find(
    (m) => sameUserId(m.userId, userId) && m.orgId === args.orgId,
  )
  if (!membership)
    throw new CustomConvexError({
      statusCode: 403,
      message: "You do not have permission to access this structure",
    })
  return { userId, membership }
}

export async function requireUser(ctx: Ctx): Promise<Doc<"users">> {
  const userId = await requireUserId(ctx)
  const user = await ctx.db.get(userId)
  if (!user)
    throw new CustomConvexError({
      statusCode: 401,
      message: "User not found",
    })
  return user
}

export async function getOrgMembership(
  ctx: Ctx,
  orgId: Id<"organizations">,
  userId: Id<"users">,
) {
  return await ctx.db
    .query("orgMembers")
    .withIndex("by_org_user", (q) =>
      q.eq("orgId", orgId).eq("userId", userId),
    )
    .unique()
}

export async function requireOrgMember(
  ctx: Ctx,
  orgId: Id<"organizations">,
  roles?: Array<"owner" | "admin" | "member">,
) {
  const userId = await requireUserId(ctx)
  const membership = await getOrgMembership(ctx, orgId, userId)
  if (!membership)
    throw new CustomConvexError({
      statusCode: 403,
      message: "You are not a member of this organization",
    })
  if (roles && !roles.includes(membership.role))
    throw new CustomConvexError({
      statusCode: 403,
      message: "Insufficient organization permissions",
    })
  return { userId, membership }
}

export function parseOrgId(
  ctx: Ctx,
  orgId: string,
): Id<"organizations"> | null {
  return ctx.db.normalizeId("organizations", orgId)
}
