import { httpRouter } from "convex/server"
import { isCustomConvexError } from "../src/lib/custom-convex-error"
import { api, internal } from "./_generated/api"
import { Doc, Id } from "./_generated/dataModel"
import { httpAction } from "./_generated/server"

const http = httpRouter()

http.route({
  path: "/getFile",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
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
    if (!currentUser)
      return new Response(null, {
        status: 401,
        headers: {
          "Access-Control-Allow-Origin": "*",
          Vary: "origin",
        },
      })
    const { searchParams } = new URL(request.url)
    const storageId = searchParams.get("storageId")! as Id<"_storage">

    let file: Doc<"files"> | null = null
    try {
      file = await ctx.runQuery(api.files.getNodeFileByStorageId, {
        storageId,
      })
    } catch (error) {
      if (isCustomConvexError(error))
        return new Response(
          JSON.stringify({
            message: error.data.message,
            statusCode: error.data.statusCode,
          }),
          {
            status: error.data.statusCode,
          },
        )
      return new Response(null, {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          Vary: "origin",
        },
      })
    }

    if (!file)
      return new Response("File not found", {
        status: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          Vary: "origin",
        },
      })

    const blob = await ctx.storage.get(storageId)
    if (blob === null) {
      return new Response("File not found", {
        status: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          Vary: "origin",
        },
      })
    }
    return new Response(blob, {
      headers: {
        "Content-Type": file.type,
        "Content-Disposition": `attachment; filename="${file.name}"`,
        "Access-Control-Allow-Origin": "*",
        Vary: "origin",
      },
    })
  }),
})

http.route({
  path: "/stripe",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Getting the stripe-signature header
    const signature: string = request.headers.get("stripe-signature") as string
    // Getting the payload of the request
    const payload = await request.text()
    // Calling the action that will perform our fulfillment
    const result = await ctx.runAction(internal.stripe.fulfill, {
      signature,
      payload,
    })
    if (result.success) {
      // We make sure to confirm the successful processing
      // so that Stripe can stop sending us the confirmation
      // of this payment.
      return new Response(null, {
        status: 200,
      })
    } else {
      // If something goes wrong Stripe will continue repeating
      // the same webhook request until we confirm it.
      return new Response("Webhook Error", {
        status: 400,
      })
    }
  }),
})

export default http
