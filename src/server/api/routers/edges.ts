import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "../trpc"
import { edges } from "~/server/db/schema"
import { eq } from "drizzle-orm"

export const edgeRouter = createTRPCRouter({
  getByStructureId: protectedProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      return await ctx.db
        .select({
          id: edges.id,
          source: edges.source,
          target: edges.target,
          data: {
            startLabel: edges.startLabel,
            label: edges.label,
            endLabel: edges.endLabel,
          },
        })
        .from(edges)
        .where(eq(edges.structureId, input))
    }),
})
