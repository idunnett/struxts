import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "../trpc"
import { usersStructures } from "~/server/db/schema"
import { and, eq } from "drizzle-orm"
import { clerkClient } from "@clerk/nextjs/server"
import { TRPCError } from "@trpc/server"

export const userRouter = createTRPCRouter({
  getStructureCollaborators: protectedProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const collaborators = await ctx.db
        .select({
          userId: usersStructures.userId,
        })
        .from(usersStructures)
        .where(eq(usersStructures.structureId, input))

      return await Promise.all(
        collaborators.map((collaborator) =>
          clerkClient.users.getUser(collaborator.userId),
        ),
      )
    }),

  search: protectedProcedure.input(z.string()).query(async ({ input }) => {
    if (input.length < 3) return []
    const users = await clerkClient.users.getUserList({
      query: input,
      limit: 5,
    })
    return users.data
  }),

  addToStructure: protectedProcedure
    .input(
      z.object({
        structureId: z.number(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Add user to structure
      const [currentUserStructure] = await ctx.db
        .select({
          userId: usersStructures.userId,
        })
        .from(usersStructures)
        .where(
          and(
            eq(usersStructures.userId, ctx.session.userId),
            eq(usersStructures.structureId, input.structureId),
          ),
        )
        .limit(1)
      if (!currentUserStructure)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a member of this structure",
        })

      const user = await clerkClient.users.getUser(input.userId)
      if (!user)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        })

      await ctx.db
        .insert(usersStructures)
        .values({
          userId: user.id,
          structureId: input.structureId,
        })
        .onConflictDoNothing()

      return user
    }),
})
