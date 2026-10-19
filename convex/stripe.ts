"use node"

import { v } from "convex/values"
import Stripe from "stripe"
import { internal } from "./_generated/api"
import type { Id } from "./_generated/dataModel"
import { internalAction } from "./_generated/server"

function packageFromProductName(name: string | null | undefined) {
  const n = (name ?? "").toLowerCase()
  if (n.includes("enterprise")) return "enterprise" as const
  if (n.includes("pro")) return "pro" as const
  return "free" as const
}

export const fulfill = internalAction({
  args: { signature: v.string(), payload: v.string() },
  handler: async (ctx, { signature, payload }) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      )

      if (
        event.type === "customer.subscription.updated" ||
        event.type === "customer.subscription.created" ||
        event.type === "customer.subscription.deleted"
      ) {
        const subscription = event.data.object as Stripe.Subscription & {
          plan?: Stripe.Plan
        }
        const orgId = subscription.metadata.orgId as
          | Id<"organizations">
          | undefined
        if (!orgId) throw new Error("Missing orgId in subscription metadata")

        if (
          event.type === "customer.subscription.deleted" ||
          subscription.status === "canceled"
        ) {
          await ctx.runMutation(internal.billing.clearSubscription, { orgId })
          return { success: true }
        }

        const currentStripeSubscriptions = await stripe.subscriptions.search({
          query: `metadata["orgId"]:"${orgId}" AND status:"active"`,
        })

        for (const other of currentStripeSubscriptions.data) {
          if (other.id === subscription.id) continue
          await stripe.subscriptions.cancel(other.id)
        }

        const priceId =
          subscription.items.data[0]?.price.id ?? subscription.plan?.id
        const productId =
          (typeof subscription.items.data[0]?.price.product === "string"
            ? subscription.items.data[0]?.price.product
            : undefined) ??
          (typeof subscription.plan?.product === "string"
            ? subscription.plan.product
            : undefined)

        if (!productId) throw new Error("Missing product on subscription")

        const product = await stripe.products.retrieve(productId)
        let maxAllowedMemberships = product.metadata.members
          ? Number(product.metadata.members)
          : 1
        if (isNaN(maxAllowedMemberships)) maxAllowedMemberships = 1

        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id

        await ctx.runMutation(internal.billing.upsertFromStripe, {
          orgId,
          stripeCustomerId: customerId,
          package: packageFromProductName(product.name),
          status: "active",
          stripePriceId: priceId,
          stripeProductId: productId,
          nodesPerStructure: product.metadata.nodesPerStructure,
          storage: product.metadata.storage,
          structures: product.metadata.structures,
          maxAllowedMemberships,
        })
      }
      return { success: true }
    } catch (err) {
      console.error(err)
      return { success: false }
    }
  },
})
