import { TRPCError } from "@trpc/server"
import { and, eq } from "drizzle-orm"
import { z } from "zod"

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc"
import { usersStructures, structures } from "~/server/db/schema"

export const structureRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [newStructure] = await ctx.db
        .insert(structures)
        .values({
          name: input.name,
          createdById: ctx.session.user.id,
        })
        .returning({ id: structures.id })

      if (!newStructure) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create structure",
        })
      }

      await ctx.db.insert(usersStructures).values({
        userId: ctx.session.user.id,
        structureId: newStructure.id,
      })

      return newStructure.id
    }),

  getAllOfMy: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select({
        id: structures.id,
        name: structures.name,
      })
      .from(usersStructures)
      .innerJoin(structures, eq(structures.id, usersStructures.structureId))
      .where(eq(usersStructures.userId, ctx.session.user.id))
      .orderBy(structures.updatedAt)
  }),

  getOneOfMy: protectedProcedure.query(async ({ ctx }) => {
    const [firstStructure] = await ctx.db
      .select({
        id: structures.id,
        name: structures.name,
      })
      .from(usersStructures)
      .innerJoin(structures, eq(structures.id, usersStructures.structureId))
      .where(eq(usersStructures.userId, ctx.session.user.id))
      .limit(1)

    return firstStructure
  }),

  getById: protectedProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const [structure] = await ctx.db
        .select({
          id: structures.id,
          name: structures.name,
        })
        .from(usersStructures)
        .innerJoin(structures, eq(structures.id, usersStructures.structureId))
        .where(
          and(
            eq(structures.id, input),
            eq(usersStructures.userId, ctx.session.user.id),
          ),
        )
        .limit(1)

      return structure
    }),
})
