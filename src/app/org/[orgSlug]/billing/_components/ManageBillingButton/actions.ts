"use server"

import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server"
import { fetchQuery } from "convex/nextjs"
import Stripe from "stripe"
import { api } from "../../../../../../../convex/_generated/api"
import { env } from "../../../../../../env"
import { getOrigin } from "../../../../../../lib/utils"

const stripe = new Stripe(env.STRIPE_SECRET_KEY)

export async function createCustomerPortalSession({
  orgId,
  orgSlug,
  customerId,
}: {
  orgId: string
  orgSlug: string
  customerId: string
}) {
  const token = await convexAuthNextjsToken()
  if (!token)
    return { success: false as const, error: "Unauthorized" }

  const org = await fetchQuery(
    api.organizations.getById,
    { orgId },
    { token },
  )
  if (!org || (org.role !== "owner" && org.role !== "admin"))
    return { success: false as const, error: "Forbidden" }

  const billing = await fetchQuery(
    api.billing.getForOrg,
    { orgId },
    { token },
  )
  if (!billing?.stripeCustomerId || billing.stripeCustomerId !== customerId)
    return { success: false as const, error: "Invalid customer" }

  const origin = getOrigin()
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/org/${orgSlug}/billing`,
    })

    return { success: true as const, url: session.url }
  } catch (error) {
    console.error("Error creating customer portal session:", error)
    return { success: false as const, error: "Failed to create customer portal session" }
  }
}
