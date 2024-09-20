// This pragma is important because Stripe's SDK currently
// only works in the Node Runtime
"use node"

import { clerkClient } from "@clerk/clerk-sdk-node"
import { v } from "convex/values"
import Stripe from "stripe"
import { internalAction } from "./_generated/server"

export const fulfill = internalAction({
  args: { signature: v.string(), payload: v.string() },
  handler: async (_ctx, { signature, payload }) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
    try {
      // This call verifies the request
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      )

      console.log("WEBHOOK EVENT::", event)
      if (event.type === "customer.subscription.updated") {
        const orgId = event.data.object.metadata.orgId
        const userId = event.data.object.metadata.userId

        if (!orgId) throw new Error("Missing orgId in metadata")
        if (!userId) throw new Error("Missing userId in metadata")

        const user = await clerkClient.users.getUser(userId)
        if (!user) throw new Error("User not found. userId: " + userId)
        const organization = await clerkClient.organizations.getOrganization({
          organizationId: orgId,
        })
        if (!organization)
          throw new Error("Organization not found. orgId: " + orgId)

        const currentOrgPlan = organization.publicMetadata?.plan
        const currentStripeSubscriptions = await stripe.subscriptions.search({
          query: `metadata["orgId"]:"${orgId}" AND status:"active"`,
        })

        console.log("currentOrgPlan::", currentOrgPlan)
        console.log("currentStripeSubscriptions::", currentStripeSubscriptions)

        for (const subscription of currentStripeSubscriptions.data) {
          if (subscription.id === event.data.object.id) continue
          await stripe.subscriptions.cancel(subscription.id)
        }

        const subscription = event.data.object as Stripe.Subscription & {
          plan: Stripe.Plan
        }
        const product = await stripe.products.retrieve(
          subscription.plan.product as string,
        )
        let maxAllowedMemberships = product.metadata.members
          ? Number(product.metadata.members)
          : 1
        if (isNaN(maxAllowedMemberships)) maxAllowedMemberships = 1

        await clerkClient.organizations.updateOrganization(organization.id, {
          maxAllowedMemberships,
          publicMetadata: {
            customer: subscription.customer,
            plan: subscription.plan,
            nodesPerStructure: product.metadata.nodesPerStructure,
            storage: product.metadata.storage,
            structures: product.metadata.structures,
          },
        })
      }
      return { success: true }
    } catch (err) {
      console.error(err)
      return { success: false }
    }
  },
})
