import type { Doc } from "../_generated/dataModel"
import type { QueryCtx } from "../_generated/server"

/**
 * Convex Auth JWTs set `subject` to `${userId}|${sessionId}`.
 * Strip the session segment when present so we can look up users.
 */
export function unwrapAuthSubject(value: string): string {
  const divider = value.indexOf("|")
  return divider === -1 ? value : value.slice(0, divider)
}

/** Resolve a users row from a Convex id, auth subject, or legacy Clerk user id. */
export async function resolveUser(
  ctx: QueryCtx,
  userId: string,
): Promise<Doc<"users"> | null> {
  const candidate = unwrapAuthSubject(userId)
  const id = ctx.db.normalizeId("users", candidate)
  if (id) {
    const user = await ctx.db.get(id)
    if (user) return user
  }

  return await ctx.db
    .query("users")
    .withIndex("legacyClerkUserId", (q) =>
      q.eq("legacyClerkUserId", candidate),
    )
    .unique()
}

export async function getUserAvatarUrl(
  ctx: QueryCtx,
  user: Doc<"users">,
): Promise<string> {
  if (user.imageStorageId) {
    const url = await ctx.storage.getUrl(user.imageStorageId)
    if (url) return url
  }
  return user.image ?? user.oauthImage ?? ""
}

export async function toPublicProfile(ctx: QueryCtx, userId: string) {
  const user = await resolveUser(ctx, userId)
  if (!user) {
    return {
      userId,
      fullName: null as string | null,
      firstName: null as string | null,
      lastName: null as string | null,
      primaryEmailAddress: null as string | null,
      imageUrl: "",
    }
  }

  const nameParts = (user.name ?? "").trim().split(/\s+/).filter(Boolean)
  return {
    userId: user._id as string,
    fullName: user.name ?? null,
    firstName: nameParts[0] ?? null,
    lastName: nameParts.slice(1).join(" ") || null,
    primaryEmailAddress: user.email ?? null,
    imageUrl: await getUserAvatarUrl(ctx, user),
  }
}
