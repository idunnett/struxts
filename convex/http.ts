import { httpRouter } from "convex/server"
import { CustomConvexError } from "../src/lib/errors"
import { api } from "./_generated/api"
import { Id } from "./_generated/dataModel"
import { httpAction } from "./_generated/server"

const http = httpRouter()

http.route({
  path: "/getFile",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    console.log("getFile")
    const currentUser = await ctx.auth.getUserIdentity()
    if (!currentUser)
      throw new CustomConvexError({
        statusCode: 401,
        message: "You must be logged in to view files",
      })
    const { searchParams } = new URL(request.url)
    const storageId = searchParams.get("storageId")! as Id<"_storage">

    const file = await ctx.runQuery(api.files.getNodeFileByStorageId, {
      storageId,
    })

    if (!file)
      return new Response("File not found", {
        status: 404,
      })

    const blob = await ctx.storage.get(storageId)
    if (blob === null) {
      return new Response("File not found", {
        status: 404,
      })
    }
    return new Response(blob)
  }),
})

export default http
