import { z } from "zod"
import {
  createTRPCRouter,
  protectedProcedure,
  structureAdminProcedure,
} from "../trpc"
import { usersStructures } from "~/server/db/schema"
import { and, desc, eq } from "drizzle-orm"
import { clerkClient } from "@clerk/nextjs/server"
import { TRPCError } from "@trpc/server"
import { type StruxtUser } from "~/types"
import { getCurrentStructureUser } from "~/server/actions/getCurrentStructureUser"

export const userRouter = createTRPCRouter({
  getCurrentStructureUser: protectedProcedure
    .input(z.number())
    .query(({ ctx, input }) => getCurrentStructureUser(ctx, input)),
  getStructureMembers: protectedProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const members = await ctx.db
        .select({
          userId: usersStructures.userId,
          role: usersStructures.role,
        })
        .from(usersStructures)
        .where(eq(usersStructures.structureId, input))
        .orderBy(desc(usersStructures.role))

      const clerkUsers = await Promise.all(
        members.map((member) => clerkClient.users.getUser(member.userId)),
      )

      return clerkUsers.map((user, i) => ({
        clerkUser: user,
        role: members[i]?.role ?? "Guest",
      }))
    }),

  search: protectedProcedure.input(z.string()).query(async ({ input }) => {
    if (input.length < 3) return []
    const users = await clerkClient.users.getUserList({
      query: input,
      limit: 5,
    })
    return users.data
  }),

  addToStructure: structureAdminProcedure
    .input(
      z.object({
        structureId: z.number(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = await clerkClient.users.getUser(input.userId)
      if (!user)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        })

      const [res] = await ctx.db
        .insert(usersStructures)
        .values({
          userId: user.id,
          structureId: input.structureId,
          role: "Guest",
        })
        .onConflictDoNothing()
        .returning({
          role: usersStructures.role,
        })

      return {
        clerkUser: user,
        role: res?.role ?? "Guest",
      } satisfies StruxtUser
    }),
  removeFromStructure: structureAdminProcedure
    .input(
      z.object({
        structureId: z.number(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const clerkUserToRemove = await clerkClient.users.getUser(input.userId)
      if (!clerkUserToRemove)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        })
      const [structureUserToRemove] = await ctx.db
        .select({
          userId: usersStructures.userId,
          role: usersStructures.role,
        })
        .from(usersStructures)
        .where(
          and(
            eq(usersStructures.structureId, input.structureId),
            eq(usersStructures.userId, input.userId),
          ),
        )
        .limit(1)
      if (!structureUserToRemove)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "User to remove is not a member of this structure",
        })

      if (
        ctx.currentStructureUser.role !== "Owner" &&
        structureUserToRemove.role === "Admin"
      )
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "You do not have permission to remove an Admin from this structure",
        })

      await ctx.db
        .delete(usersStructures)
        .where(
          and(
            eq(usersStructures.userId, clerkUserToRemove.id),
            eq(usersStructures.structureId, input.structureId),
          ),
        )
    }),
  updateUserRole: structureAdminProcedure
    .input(
      z.object({
        structureId: z.number(),
        userId: z.string(),
        role: z.enum(["Owner", "Admin", "Guest"]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const clerkUser = await clerkClient.users.getUser(input.userId)
      if (!clerkUser)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        })
      const [structureUser] = await ctx.db
        .select({
          userId: usersStructures.userId,
          role: usersStructures.role,
        })
        .from(usersStructures)
        .where(
          and(
            eq(usersStructures.structureId, input.structureId),
            eq(usersStructures.userId, input.userId),
          ),
        )
        .limit(1)
      if (!structureUser)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "User is not a member of this structure",
        })

      if (
        ctx.currentStructureUser.role !== "Owner" &&
        structureUser.role === "Admin" &&
        input.role !== "Admin"
      )
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to demote an Admin",
        })

      if (ctx.currentStructureUser.role !== "Owner" && input.role === "Owner")
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to promote a user to Owner",
        })

      await ctx.db
        .update(usersStructures)
        .set({ role: input.role })
        .where(
          and(
            eq(usersStructures.structureId, input.structureId),
            eq(usersStructures.userId, input.userId),
          ),
        )
    }),
})
