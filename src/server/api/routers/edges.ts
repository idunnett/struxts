import { eq } from "drizzle-orm"
import { z } from "zod"
import { edgeLabels, edges } from "~/server/db/schema"
import { createTRPCRouter, protectedProcedure } from "../trpc"

export const edgeRouter = createTRPCRouter({
  getByStructureId: protectedProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const edgesWithLabels = await ctx.db
        .select({
          id: edges.id,
          source: edges.source,
          target: edges.target,
          color: edges.color,
          edgeLabelId: edgeLabels.id,
          edgeLabel: edgeLabels.label,
          edgeLabelOffset: edgeLabels.offset,
        })
        .from(edges)
        .leftJoin(edgeLabels, eq(edgeLabels.edgeId, edges.id))
        .where(eq(edges.structureId, input))

      const groupedEdges: {
        id: number
        source: number
        target: number
        data: {
          color: string
          labels: { id: number; label: string; offset: number }[]
        }
      }[] = []
      for (const edge of edgesWithLabels) {
        const existingEdge = groupedEdges.find((e) => e.id === edge.id)
        if (existingEdge) {
          if (!edge.edgeLabelId || !edge.edgeLabel || !edge.edgeLabelOffset)
            continue
          existingEdge.data.labels.push({
            id: edge.edgeLabelId,
            label: edge.edgeLabel,
            offset: edge.edgeLabelOffset,
          })
        } else {
          groupedEdges.push({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            data: {
              color: edge.color,
              labels:
                edge.edgeLabelId && edge.edgeLabel && edge.edgeLabelOffset
                  ? [
                      {
                        id: edge.edgeLabelId,
                        label: edge.edgeLabel,
                        offset: edge.edgeLabelOffset,
                      },
                    ]
                  : [],
            },
          })
        }
      }

      return groupedEdges
    }),
})
