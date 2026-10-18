import Google from "@auth/core/providers/google"
import { Password } from "@convex-dev/auth/providers/Password"
import { convexAuth } from "@convex-dev/auth/server"
import type { MutationCtx } from "./_generated/server"
import type { Id } from "./_generated/dataModel"

async function applyOAuthImage(
  ctx: MutationCtx,
  userId: Id<"users">,
  oauthImage: string | undefined,
) {
  if (!oauthImage) return
  const user = await ctx.db.get(userId)
  if (!user) return

  // Always keep the latest OAuth photo as a fallback.
  const patch: { oauthImage: string; image?: string } = {
    oauthImage,
  }
  // Only update the display image when the user has not uploaded a custom one.
  if (!user.imageStorageId) patch.image = oauthImage
  await ctx.db.patch(userId, patch)
}

async function findOrCreateUser(
  ctx: MutationCtx,
  args: {
    existingUserId: Id<"users"> | null
    profile: {
      email?: string
      name?: string
      image?: string
      emailVerified?: boolean
    }
  },
): Promise<Id<"users">> {
  if (args.existingUserId) {
    const updates: {
      name?: string
      emailVerificationTime?: number
    } = {}
    if (args.profile.name) updates.name = args.profile.name
    if (args.profile.emailVerified)
      updates.emailVerificationTime = Date.now()
    if (Object.keys(updates).length > 0)
      await ctx.db.patch(args.existingUserId, updates)
    await applyOAuthImage(ctx, args.existingUserId, args.profile.image)
    return args.existingUserId
  }

  const email = args.profile.email?.toLowerCase()
  if (email) {
    const existing = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .unique()
    if (existing) {
      const updates: {
        name?: string
        emailVerificationTime?: number
      } = {}
      if (args.profile.name && !existing.name) updates.name = args.profile.name
      if (args.profile.emailVerified && !existing.emailVerificationTime)
        updates.emailVerificationTime = Date.now()
      if (Object.keys(updates).length > 0) await ctx.db.patch(existing._id, updates)
      await applyOAuthImage(ctx, existing._id, args.profile.image)
      return existing._id
    }
  }

  return await ctx.db.insert("users", {
    email,
    name: args.profile.name,
    image: args.profile.image,
    oauthImage: args.profile.image,
    emailVerificationTime: args.profile.emailVerified
      ? Date.now()
      : undefined,
  })
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        const profile: { email: string; name?: string } = {
          email: (params.email as string).toLowerCase(),
        }
        if (typeof params.name === "string" && params.name)
          profile.name = params.name
        return profile
      },
    }),
    Google({
      profile(googleProfile) {
        return {
          id: googleProfile.sub,
          name: googleProfile.name,
          email: googleProfile.email,
          image: googleProfile.picture,
          emailVerified: googleProfile.email_verified ?? true,
        }
      },
    }),
  ],
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      return await findOrCreateUser(ctx, {
        existingUserId: args.existingUserId as Id<"users"> | null,
        profile: {
          email: args.profile.email,
          name:
            typeof args.profile.name === "string"
              ? args.profile.name
              : undefined,
          image:
            typeof args.profile.image === "string"
              ? args.profile.image
              : undefined,
          emailVerified: args.profile.emailVerified,
        },
      })
    },
  },
})
