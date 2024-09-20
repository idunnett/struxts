"use server"

import { auth, clerkClient, currentUser } from "@clerk/nextjs/server"
import Stripe from "stripe"
import { env } from "../../../env"

const stripe = new Stripe(env.STRIPE_SECRET_KEY)

type LineItem = Stripe.Checkout.SessionCreateParams.LineItem

export async function createStripeCheckoutSession(
  lineItem: LineItem,
  type: Stripe.Price.BillingScheme = "per_unit",
) {
  const session = auth()
  const user = await currentUser()
  if (!session || !user)
    return {
      sessionId: null,
      checkoutError: "You must be signed in to create a checkout session.",
    }
  const orgId = session.orgId

  if (!orgId)
    return {
      sessionId: null,
      checkoutError:
        "You must have an active organization to create a checkout session.",
    }

  const orgMembersList =
    await clerkClient().organizations.getOrganizationMembershipList({
      organizationId: orgId,
    })

  const orgMembersCount = orgMembersList.totalCount
  if (!orgMembersCount)
    return {
      sessionId: null,
      checkoutError: "Organization members count not found.",
    }

  const emailAddress =
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses[0]?.emailAddress

  console.log("emailAddress::", emailAddress)

  if (!emailAddress)
    return {
      sessionId: null,
      checkoutError:
        "You must have an email address to create a checkout session.",
    }

  const origin = process.env.NEXT_PUBLIC_VERCEL_URL ?? "http://localhost:3000"

  const stripeSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      { ...lineItem, quantity: type === "tiered" ? orgMembersCount : 1 },
    ],
    billing_address_collection: "required",
    tax_id_collection: {
      enabled: true, // Enable collection of tax IDs for businesses
    },
    success_url: `${origin}/org/${orgId}/billing`,
    cancel_url: `${origin}/pricing`,
    customer_email: emailAddress,
    subscription_data: {
      metadata: {
        userId: user.id,
        orgId,
      },
    },
  })

  return {
    sessionId: stripeSession.id,
    checkoutError: null,
  }
}
