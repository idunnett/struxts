"use server"

import Stripe from "stripe"
import { env } from "../../../../../../env"
import { getOrigin } from "../../../../../../lib/utils"

const stripe = new Stripe(env.STRIPE_SECRET_KEY)

export async function createCustomerPortalSession({
  orgId,
  customerId,
}: {
  orgId: string
  customerId: string
}) {
  const origin = getOrigin()
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/org/${orgId}/billing`, // Change to your desired return URL
    })

    return { success: true, url: session.url }
  } catch (error) {
    console.error("Error creating customer portal session:", error)
    return { success: false, error: "Failed to create customer portal session" }
  }
}
