import { TRPCError } from "@trpc/server"
import { and, eq, inArray } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import {
  createTRPCRouter,
  protectedProcedure,
  structureAdminProcedure,
  structureOwnerProcedure,
} from "~/server/api/trpc"
import {
  edges,
  files,
  nodes,
  structures,
  tempFiles,
  usersStructures,
} from "~/server/db/schema"
import { deleteFile } from "../../actions/deleteFile"
import { utapi } from "../../uploadthing"

const updateFileSchema = z.object({
  id: z.string(),
  key: z.string().nullish(),
  name: z.string(),
  url: z.string().nullish(),
  parentId: z.string().nullish(),
  structureId: z.number(),
  isFolder: z.boolean(),
})
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
  files: z.array(updateFileSchema),
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
        role: "Owner",
      })

      return newStructure.id
    }),

  getAllOfMy: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db
      .selectDistinct({
        id: structures.id,
        name: structures.name,
        createdById: structures.createdById,
        createdAt: structures.createdAt,
        updatedAt: structures.updatedAt,
      })
      .from(structures)
      .leftJoin(usersStructures, eq(structures.id, usersStructures.structureId))
      .where(eq(usersStructures.userId, ctx.session.userId))
      .orderBy(structures.updatedAt)
  }),
  getById: protectedProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const [structure] = await ctx.db
        .select({
          id: structures.id,
          name: structures.name,
        })
        .from(structures)
        .leftJoin(
          usersStructures,
          eq(structures.id, usersStructures.structureId),
        )
        .where(
          and(
            eq(structures.id, input),
            eq(usersStructures.userId, ctx.session.userId),
          ),
        )
        .limit(1)

      return structure
    }),
  update: structureAdminProcedure
    .input(
      z.object({
        structureId: z.number(),
        nodes: z.array(updateNodeSchema),
        edges: z.array(updateEdgeSchema),
        nodesToDelete: z.array(z.number()),
        edgesToDelete: z.array(z.number()),
        filesToDelete: z.array(z.number()),
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
      if (input.filesToDelete.length > 0)
        for (const fileIdToDelete of input.filesToDelete) {
          await deleteFile(ctx, fileIdToDelete)
        }

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

        const newFileIds: { newId: number; oldId: string }[] = []
        for (const inputFile of inputNode.files) {
          if (!inputFile.id || inputFile.id.startsWith("reactflow__")) {
            let inputFileParentId: number | null = null
            if (inputFile.parentId) {
              if (!isNaN(Number(inputFile.parentId)))
                inputFileParentId = Number(inputFile.parentId)
            }
            const [newFile] = await ctx.db
              .insert(files)
              .values({
                id: undefined,
                key: inputFile.key,
                name: inputFile.name,
                url: inputFile.url,
                nodeId: newNode.id,
                parentId: inputFileParentId,
                structureId: input.structureId,
                isFolder: inputFile.isFolder,
              })
              .returning({ id: files.id })
            if (!newFile) continue
            if (inputFile.key) {
              await ctx.db
                .delete(tempFiles)
                .where(eq(tempFiles.key, inputFile.key))
            }
            newFileIds.push({ newId: newFile.id, oldId: inputFile.id })
            inputFile.id = newFile.id.toString()
          }
          for (const inputFile of inputNode.files) {
            if (!inputFile.parentId?.startsWith("reactflow__")) continue
            const newId = Number(inputFile.id)
            if (isNaN(newId)) continue
            const newParentId = newFileIds.find(
              (f) => f.oldId === inputFile.parentId,
            )?.newId
            if (!newParentId) continue
            await ctx.db
              .update(files)
              .set({ parentId: newParentId })
              .where(eq(files.id, newId))
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
        if (isNaN(edgeSource) || isNaN(edgeTarget) || edgeSource === edgeTarget)
          continue
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

      const unusedTempFiles = await ctx.db
        .select({ key: tempFiles.key })
        .from(tempFiles)
        .where(eq(tempFiles.structureId, input.structureId))

      if (unusedTempFiles.length) {
        const { success } = await utapi.deleteFiles(
          unusedTempFiles.map((f) => f.key),
        )
        if (success)
          await ctx.db
            .delete(tempFiles)
            .where(eq(tempFiles.structureId, input.structureId))
      }

      revalidatePath(`/structures/${input.structureId}`)
    }),
  updateName: structureOwnerProcedure
    .input(z.object({ structureId: z.number(), name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(structures)
        .set({ name: input.name })
        .where(eq(structures.id, input.structureId))
      revalidatePath(`/structures/${input.structureId}`)
      revalidatePath(`/structures/${input.structureId}/settings`)
    }),

  delete: structureOwnerProcedure
    .input(
      z.object({
        structureId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { structureId } = input
      await ctx.db.delete(edges).where(eq(edges.structureId, structureId))
      await ctx.db.delete(nodes).where(eq(nodes.structureId, structureId))
      await ctx.db
        .delete(usersStructures)
        .where(eq(usersStructures.structureId, structureId))
      await ctx.db.delete(structures).where(eq(structures.id, structureId))
      revalidatePath("/structures")
    }),
})
