import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "../trpc"
import { nodes } from "~/server/db/schema"
import { eq } from "drizzle-orm"

export const nodeRouter = createTRPCRouter({
  getByStructureId: protectedProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      return await ctx.db
        .select({
          id: nodes.id,
          position: {
            x: nodes.x,
            y: nodes.y,
          },
          data: {
            label: nodes.label,
          },
        })
        .from(nodes)
        .where(eq(nodes.structureId, input))
    }),
})
