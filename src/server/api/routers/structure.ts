import { TRPCError } from "@trpc/server"
import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc"
import { usersStructures, structures, nodes } from "~/server/db/schema"

const updateNodeSchema = z.object({
  id: z.string().optional(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  label: z.string().nullish(),
})

export type UpdateNode = z.infer<typeof updateNodeSchema>

export const structureRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [newStructure] = await ctx.db
        .insert(structures)
        .values({
          name: input.name,
          createdById: ctx.session.userId,
        })
        .returning({ id: structures.id })

      if (!newStructure) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create structure",
        })
      }

      await ctx.db.insert(usersStructures).values({
        userId: ctx.session.userId,
        structureId: newStructure.id,
      })

      return newStructure.id
    }),

  getAllOfMy: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select({
        id: structures.id,
        name: structures.name,
        createdById: structures.createdById,
      })
      .from(usersStructures)
      .innerJoin(structures, eq(structures.id, usersStructures.structureId))
      .where(eq(usersStructures.userId, ctx.session.userId))
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
      .where(eq(usersStructures.userId, ctx.session.userId))
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
            eq(usersStructures.userId, ctx.session.userId),
          ),
        )
        .limit(1)

      return structure
    }),
  update: protectedProcedure
    .input(
      z.object({
        structureId: z.number(),
        nodes: z.array(updateNodeSchema),
        // edges: z.array()
      }),
    )
    .mutation(async ({ ctx, input }) => {
      for (const inputNode of input.nodes) {
        let inputNodeId: number | undefined = undefined
        if (inputNode.id && !inputNode.id.startsWith("__")) {
          inputNodeId = Number(inputNode.id)
          if (isNaN(inputNodeId)) inputNodeId = undefined
        }
        await ctx.db
          .insert(nodes)
          .values({
            id: inputNodeId,
            x: inputNode.position.x,
            y: inputNode.position.y,
            label: inputNode.label,
            h: 100,
            w: 100,
            structureId: input.structureId,
          })
          .onConflictDoUpdate({
            target: nodes.id,
            set: {
              x: inputNode.position.x,
              y: inputNode.position.y,
              label: inputNode.label,
            },
          })
      }
      revalidatePath(`/structures/${input.structureId}`)
    }),
})
