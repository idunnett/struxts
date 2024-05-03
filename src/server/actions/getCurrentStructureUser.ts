"use server"

import { and, eq } from "drizzle-orm"
import { type TRPCContext } from "../api/trpc"
import { structures, usersStructures } from "../db/schema"

export async function getCurrentStructureUser(
  ctx: TRPCContext,
  structureId: number,
) {
  if (!ctx.session.userId) return null
  let currentStructureUser: { userId: string; role: string } | null = null
  const [owner] = await ctx.db
    .select({ userId: structures.owner })
    .from(structures)
    .where(
      and(
        eq(structures.id, structureId),
        eq(structures.owner, ctx.session.userId),
      ),
    )
  if (owner)
    currentStructureUser = { userId: ctx.session.userId, role: "Owner" }
  else {
    const [currentUserStructure] = await ctx.db
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
    if (currentUserStructure) currentStructureUser = currentUserStructure
  }
  return currentStructureUser
}
