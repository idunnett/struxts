import { Password } from "@convex-dev/auth/providers/Password"
import {
  convexAuth,
  getAuthSessionId,
  getAuthUserId,
} from "@convex-dev/auth/server"
import { query } from "./_generated/server"

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (userId === null) {
      return null
    }
    return await ctx.db.get(userId)
  },
})

export const currentSession = query({
  args: {},
  handler: async (ctx) => {
    const sessionId = await getAuthSessionId(ctx)
    if (sessionId === null) {
      return null
    }
    return await ctx.db.get(sessionId)
  },
})

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    // https://github.com/get-convex/convex-auth-example/blob/main/convex/otp/VerificationCodeEmail.tsx
    // Password({
    //   id: "password-code",
    //   reset: ResendOTPPasswordReset,
    //   verify: ResendOTP,
    // }),
    Password,
  ],
})
