import { httpRouter } from "convex/server"
import { httpAction } from "./_generated/server"

const http = httpRouter()

http.route({
  path: "/getFile",
  method: "OPTIONS",
  handler: httpAction(async (ctx, request) => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
        "Access-Control-Max-Age": "86400", // Cache preflight response for 24 hours
      },
    })
  }),
})

http.route({
  path: "/getFile",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const currentUser = await ctx.auth.getUserIdentity()
    console.log(currentUser)
    if (!request.headers.get("Authorization"))
      return new Response(null, {
        status: 401,
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
          Vary: "Origin",
        },
      })
    else
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
          Vary: "Origin",
        },
      })
    // const { searchParams } = new URL(request.url)
    // const storageId = searchParams.get("storageId")! as Id<"_storage">

    // let file: Doc<"files"> | null = null
    // try {
    //   file = await ctx.runQuery(api.files.getNodeFileByStorageId, {
    //     storageId,
    //   })
    // } catch (error) {
    //   if (isCustomConvexError(error))
    //     return new Response(null, {
    //       status: error.data.statusCode,
    //     })
    //   return new Response(null, {
    //     status: 500,
    //   })
    // }

    // return new Response(null, {
    //   status: 200,
    //   headers: {
    //     "Access-Control-Allow-Origin": "http://localhost:3000",
    //     Vary: "Origin",
    //   },
    // })

    // if (!file)
    //   return new Response("File not found", {
    //     status: 404,
    //   })

    // const blob = await ctx.storage.get(storageId)
    // if (blob === null) {
    //   return new Response("File not found", {
    //     status: 404,
    //   })
    // }
    // return new Response(blob, {
    //   headers: {
    //     "Content-Type": file.type,
    //     "Content-Disposition": `attachment; filename="${file.name}"`,
    //     "Access-Control-Allow-Origin":
    //       process.env.CLIENT_ORIGIN ?? "http://localhost",
    //     Vary: "origin",
    //   },
    // })
  }),
})

export default http
