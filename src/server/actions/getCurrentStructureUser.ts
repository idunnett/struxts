"use server"

import { and, eq } from "drizzle-orm"
import { type TRPCContext } from "../api/trpc"
import { usersStructures } from "../db/schema"

export async function getCurrentStructureUser(
  ctx: TRPCContext,
  structureId: number,
) {
  if (!ctx.session.userId) return null

  const [currentStructureUser] = await ctx.db
    .select({
      userId: usersStructures.userId,
      role: usersStructures.role,
    })
    .from(usersStructures)
    .where(
      and(
        eq(usersStructures.userId, ctx.session.userId),
        eq(usersStructures.structureId, structureId),
      ),
    )
    .limit(1)

  return currentStructureUser
}
