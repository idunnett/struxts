import { and, eq, not } from "drizzle-orm"
import { type TRPCContext } from "../api/trpc"
import { files } from "../db/schema"
import { utapi } from "../uploadthing"

// A helper function to fetch all descendants of a file
async function getAllDescendants(ctx: TRPCContext, fileId: number) {
  const children = await ctx.db
    .select({ id: files.id, key: files.key })
    .from(files)
    .where(and(eq(files.parentId, fileId), not(eq(files.id, fileId))))

  let allDescendants: { id: number; key: string | null }[] = []

  for (const child of children) {
    allDescendants.push(child)
    const descendantsOfChild = await getAllDescendants(ctx, child.id)
    allDescendants = allDescendants.concat(descendantsOfChild)
  }

  return allDescendants
}

// The main function to delete a file and its children recursively
export async function deleteFile(ctx: TRPCContext, fileId: number) {
  const fileToDelete = await ctx.db
    .select({ id: files.id })
    .from(files)
    .where(eq(files.id, fileId))
    .limit(1)

  if (!fileToDelete.length) throw new Error(`File with id ${fileId} not found`)

  // Get all descendants of the file
  const allDescendants = await getAllDescendants(ctx, fileId)

  // Delete all descendants in reverse order (leaf nodes first)
  for (const { id, key } of allDescendants.reverse()) {
    if (key) {
      const { success } = await utapi.deleteFiles([key])
      if (!success) continue
    }
    await ctx.db.delete(files).where(eq(files.id, id))
  }

  // Finally, delete the parent file
  await ctx.db.delete(files).where(eq(files.id, fileId))
}
