import { Password } from "@convex-dev/auth/providers/Password"
import {
  convexAuth,
  getAuthSessionId,
  getAuthUserId,
} from "@convex-dev/auth/server"
import { z, ZodError } from "zod"
import { CustomConvexError } from "../src/lib/errors"
import { DataModel } from "./_generated/dataModel"
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

const signInParamsSchema = z.object({
  email: z.string().email(),
})

const signUpParamsSchema = signInParamsSchema.extend({
  name: z.string().min(3).max(100),
})

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    // https://github.com/get-convex/convex-auth-example/blob/main/convex/otp/VerificationCodeEmail.tsx
    // Password({
    //   id: "password-code",
    //   reset: ResendOTPPasswordReset,
    //   verify: ResendOTP,
    // }),
    Password<DataModel>({
      profile(params) {
        let returnData: { email: string; name?: string } | undefined = undefined
        let err: ZodError | undefined = undefined
        if (params.flow === "signUp") {
          const { error, data } = signUpParamsSchema.safeParse(params)
          if (error) err = error
          if (data) returnData = { email: data.email, name: data.name }
        } else {
          const { error, data } = signInParamsSchema.safeParse(params)
          if (error) err = error
          if (data) returnData = { email: data.email }
        }
        if (err || !returnData) {
          let message = "Invalid parameters"
          if (err?.errors[0]?.message) message = err.errors[0]?.message
          throw new CustomConvexError({
            message,
            statusCode: 400,
          })
        }

        return returnData
      },
    }),
  ],
})
