import { and, eq } from "drizzle-orm"
import { z } from "zod"
import { db } from "../../db"
import { files } from "../../db/schema"
import { createTRPCRouter, protectedProcedure } from "../trpc"

export const fileRouter = createTRPCRouter({
  getByStructureId: protectedProcedure
    .input(z.number())
    .query(async ({ input }) => {
      const fileResults = await db
        .select({
          id: files.id,
          key: files.key,
          name: files.name,
          url: files.url,
          parentId: files.parentId,
          structureId: files.structureId,
          nodeId: files.nodeId,
          isFolder: files.isFolder,
        })
        .from(files)
        .where(and(eq(files.structureId, input)))
      return fileResults
    }),
})
