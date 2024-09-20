"use server"

import Stripe from "stripe"
import { env } from "../../../../../../env"

const stripe = new Stripe(env.STRIPE_SECRET_KEY)

export async function createCustomerPortalSession({
  orgId,
  customerId,
}: {
  orgId: string
  customerId: string
}) {
  const origin = process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : "http://localhost:3000"
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
