import { getAuthUserId } from "@convex-dev/auth/server"
import { v } from "convex/values"
import { nanoid } from "nanoid"
import { Resend } from "resend"
import { CustomConvexError } from "../src/lib/errors"
import { api } from "./_generated/api"
import { action, mutation } from "./_generated/server"

export const createInvite = mutation({
  args: {
    structureId: v.string(),
    email: v.string(),
    domain: v.string(),
  },
  handler: async (ctx, { structureId, email, domain }) => {
    const userId = await getAuthUserId(ctx)
    if (!userId)
      throw new CustomConvexError({
        statusCode: 401,
        message: "Unauthorized",
      })

    const user = await ctx.db.get(userId)
    if (!user)
      throw new CustomConvexError({
        statusCode: 404,
        message: "User not found",
      })

    if (user.email?.toLowerCase() === email.toLowerCase())
      throw new CustomConvexError({
        statusCode: 400,
        message: "You cannot invite yourself",
      })

    const serializedStructureId = ctx.db.normalizeId("structures", structureId)
    if (!serializedStructureId)
      throw new CustomConvexError({
        statusCode: 404,
        message: "Structure not found",
      })
    const structure = await ctx.db.get(serializedStructureId)
    if (!structure)
      throw new CustomConvexError({
        statusCode: 404,
        message: "Structure not found",
      })

    const orgStructureUser = await ctx.db
      .query("orgStructureUsers")
      .filter((q) =>
        q.and(
          q.eq(q.field("structureId"), structureId),
          q.eq(q.field("userId"), userId),
        ),
      )
      .first()

    if (!orgStructureUser)
      throw new CustomConvexError({
        statusCode: 404,
        message: "User not found in structure",
      })

    if (
      orgStructureUser?.role !== "Owner" &&
      orgStructureUser?.role !== "Admin"
    )
      throw new CustomConvexError({
        statusCode: 403,
        message: "Only structure admins can invite",
      })

    const existingInvite = await ctx.db
      .query("invites")
      .filter((q) =>
        q.and(
          q.eq(q.field("email"), email),
          q.eq(q.field("structureId"), serializedStructureId),
          q.eq(q.field("accepted"), false),
          q.gt(q.field("createdAt"), Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days
        ),
      )
      .first()
    if (existingInvite)
      throw new CustomConvexError({
        statusCode: 400,
        message:
          "An active invite to this structure for this email already exists",
      })

    const token = nanoid()

    await ctx.db.insert("invites", {
      email,
      structureId: serializedStructureId,
      inviterId: userId,
      token,
      accepted: false,
      createdAt: Date.now(),
    })

    // Generate your invite link
    const inviteLink = `${domain}/invite?token=${token}`

    // Call the action to send the email
    await ctx.scheduler.runAfter(0, api.invites.sendInviteEmail, {
      to: email,
      inviteLink,
      inviterId: userId,
    })

    return token // you can send this via email
  },
})

export const sendInviteEmail = action({
  args: {
    to: v.string(),
    inviteLink: v.string(),
    inviterId: v.id("users"),
  },
  handler: async (ctx, { to, inviteLink, inviterId }) => {
    const user = await ctx.runQuery(api.users.getById, { id: inviterId })
    if (!user)
      throw new CustomConvexError({
        statusCode: 404,
        message: "User not found",
      })

    const resend = new Resend(process.env.RESEND_API_KEY!)

    const result = await resend.emails.send({
      from: `${user.name || user.email || "struxts.com"} <noreply@struxts.com>`,
      to,
      subject: `[struxts.com] ${user.name || user.email || "Someone"} has invited you to join a structure`,
      html: `
      <div style="background-color: #f0f0f0; padding: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
        <h2>${user.name || user.email || "Someone"} has invited you to join a structure on struxts.com</h2>
        <br />
        <a href="${inviteLink}" target="_blank" style="color: #000; text-decoration: none; background-color: #000; color: #fff; padding: 10px 20px; border-radius: 5px; display: inline-block; margin-top: 10px; text-align: center; font-size: 16px;">Accept invite</a>
        <br />
        <p>Your login email is: ${user.email}</p>
      </div>
    `,
    })

    if (result.error)
      throw new CustomConvexError({
        statusCode: 500,
        message: result.error.message,
      })

    return result?.data?.id
  },
})

export const acceptInvite = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, { token }) => {
    const userId = await getAuthUserId(ctx)
    if (!userId)
      throw new CustomConvexError({
        statusCode: 401,
        message: "Unauthorized",
      })

    const user = await ctx.db.get(userId)
    if (!user)
      throw new CustomConvexError({
        statusCode: 404,
        message: "User not found",
      })

    const invite = await ctx.db
      .query("invites")
      .filter((q) =>
        q.and(
          q.eq(q.field("token"), token),
          q.gt(q.field("createdAt"), Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days
        ),
      )
      .unique()

    if (!invite)
      throw new CustomConvexError({
        statusCode: 400,
        message: "Invite invalid or expired",
      })

    if (user.email?.toLowerCase() !== invite.email.toLowerCase())
      throw new CustomConvexError({
        statusCode: 400,
        message:
          "We couldn't find your invite. Try logging in with a different account.",
      })

    if (invite.accepted) {
      const orgStructureUser = await ctx.db
        .query("orgStructureUsers")
        .filter((q) =>
          q.and(
            q.eq(q.field("userId"), userId),
            q.eq(q.field("structureId"), invite.structureId),
          ),
        )
        .first()

      if (orgStructureUser) return invite.structureId
      else
        throw new CustomConvexError({
          statusCode: 400,
          message: "Invite invalid or expired",
        })
    }

    // Add user to structure
    await ctx.db.insert("orgStructureUsers", {
      userId,
      structureId: invite.structureId,
      role: "Guest",
    })

    // Mark invite as accepted
    await ctx.db.patch(invite._id, { accepted: true })

    return invite.structureId
  },
})
