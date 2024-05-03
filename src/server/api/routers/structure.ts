import { TRPCError } from "@trpc/server"
import { and, eq, inArray } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc"
import { usersStructures, structures, nodes, edges } from "~/server/db/schema"

const updateNodeSchema = z.object({
  id: z.string().optional(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  label: z.string().nullish(),
  info: z.string().nullish(),
  borderColor: z.string().nullish(),
  bgColor: z.string().nullish(),
})
export type UpdateNode = z.infer<typeof updateNodeSchema>
const updateEdgeSchema = z.object({
  id: z.string().optional(),
  source: z.string().or(z.number()),
  target: z.string().or(z.number()),
  startLabel: z.string().nullish(),
  endLabel: z.string().nullish(),
  label: z.string().nullish(),
  color: z.string().nullish(),
})
export type UpdateEdge = z.infer<typeof updateEdgeSchema>

export const structureRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [newStructure] = await ctx.db
        .insert(structures)
        .values({
          name: input.name,
          createdById: ctx.session.userId,
          owner: ctx.session.userId,
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
        owner: structures.owner,
        createdAt: structures.createdAt,
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
        edges: z.array(updateEdgeSchema),
        nodesToDelete: z.array(z.number()),
        edgesToDelete: z.array(z.number()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.edgesToDelete.length > 0)
        await ctx.db
          .delete(edges)
          .where(
            and(
              inArray(edges.id, input.edgesToDelete),
              eq(edges.structureId, input.structureId),
            ),
          )
      if (input.nodesToDelete.length > 0)
        await ctx.db
          .delete(nodes)
          .where(
            and(
              inArray(nodes.id, input.nodesToDelete),
              eq(nodes.structureId, input.structureId),
            ),
          )
      for (const inputNode of input.nodes) {
        let inputNodeId: number | undefined = undefined
        if (inputNode.id && !inputNode.id.startsWith("reactflow__")) {
          inputNodeId = Number(inputNode.id)
          if (isNaN(inputNodeId)) inputNodeId = undefined
        }
        const [newNode] = await ctx.db
          .insert(nodes)
          .values({
            id: inputNodeId,
            x: inputNode.position.x,
            y: inputNode.position.y,
            label: inputNode.label,
            info: inputNode.info,
            borderColor: inputNode.borderColor ?? "#000000",
            bgColor: inputNode.bgColor ?? "#ffffff",
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
              info: inputNode.info,
              borderColor: inputNode.borderColor ?? "#000000",
              bgColor: inputNode.bgColor ?? "#ffffff",
            },
          })
          .returning({ id: nodes.id })

        if (!newNode) continue
        if (inputNode.id?.startsWith("reactflow__")) {
          for (const inputEdge of input.edges) {
            if (inputEdge.source === inputNode.id) inputEdge.source = newNode.id
            if (inputEdge.target === inputNode.id) inputEdge.target = newNode.id
          }
        }
      }
      for (const inputEdge of input.edges) {
        let inputEdgeId: number | undefined = undefined
        if (inputEdge.id && !inputEdge.id.startsWith("reactflow__")) {
          inputEdgeId = Number(inputEdge.id)
          if (isNaN(inputEdgeId)) inputEdgeId = undefined
        }
        const edgeSource = Number(inputEdge.source)
        const edgeTarget = Number(inputEdge.target)
        if (isNaN(edgeSource) || isNaN(edgeTarget)) continue
        await ctx.db
          .insert(edges)
          .values({
            id: inputEdgeId,
            source: edgeSource,
            target: edgeTarget,
            startLabel: inputEdge.startLabel,
            label: inputEdge.label,
            endLabel: inputEdge.endLabel,
            color: inputEdge.color ?? "#000000",
            structureId: input.structureId,
          })
          .onConflictDoUpdate({
            target: edges.id,
            set: {
              source: edgeSource,
              target: edgeTarget,
              startLabel: inputEdge.startLabel,
              label: inputEdge.label,
              endLabel: inputEdge.endLabel,
              color: inputEdge.color ?? "#000000",
            },
          })
      }

      revalidatePath(`/structures/${input.structureId}`)
    }),
})
