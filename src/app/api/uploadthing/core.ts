import { auth } from "@clerk/nextjs/server"
import { and, eq } from "drizzle-orm"
import { createUploadthing, type FileRouter } from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"
import { z } from "zod"
import { isAdmin } from "../../../lib/utils"
import { db } from "../../../server/db"
import { tempFiles, usersStructures } from "../../../server/db/schema"

const f = createUploadthing()

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  fileUploader: f({ pdf: { maxFileSize: "4MB", maxFileCount: 10 } })
    .input(
      z.object({
        structureId: z.number(),
      }),
    )
    // Set permissions and file types for this FileRoute
    .middleware(async ({ input }) => {
      // This code runs on your server before upload
      const user = auth()
      if (!user.userId) throw new UploadThingError("Unauthorized")

      if (input.structureId === 0)
        throw new UploadThingError("Invalid structureId")

      const [currentStructureUser] = await db
        .select({
          userId: usersStructures.userId,
          role: usersStructures.role,
        })
        .from(usersStructures)
        .where(
          and(
            eq(usersStructures.userId, user.userId),
            eq(usersStructures.structureId, input.structureId),
          ),
        )
        .limit(1)
      console.log("currentStructureUser", currentStructureUser)

      if (!currentStructureUser || !isAdmin(currentStructureUser.role))
        throw new UploadThingError("Unauthorized")

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return {
        userId: user.userId,
        structureId: input.structureId,
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload

      let key: string
      try {
        const [first] = await db
          .insert(tempFiles)
          .values({
            key: file.key,
            structureId: metadata.structureId,
          })
          .returning({ key: tempFiles.key })
        if (!first) return null
        key = first.key
      } catch (error) {
        console.log("error", error)
        return null
      }

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return {
        key,
        name: file.name,
        url: file.url,
      }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
