"use server"

import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server"
import { fetchQuery } from "convex/nextjs"
import Stripe from "stripe"
import { api } from "../../../../convex/_generated/api"
import { env } from "../../../env"
import { getOrigin } from "../../../lib/utils"

const stripe = new Stripe(env.STRIPE_SECRET_KEY)

type LineItem = Stripe.Checkout.SessionCreateParams.LineItem

export async function createStripeCheckoutSession(
  lineItem: LineItem,
  type: Stripe.Price.BillingScheme = "per_unit",
) {
  const token = await convexAuthNextjsToken()
  if (!token)
    return {
      sessionId: null,
      checkoutError: "You must be signed in to create a checkout session.",
    }

  const viewer = await fetchQuery(api.users.viewer, {}, { token })
  if (!viewer)
    return {
      sessionId: null,
      checkoutError: "You must be signed in to create a checkout session.",
    }

  const org = viewer.activeOrganization
  if (!org)
    return {
      sessionId: null,
      checkoutError:
        "You must have an active organization to create a checkout session.",
    }

  if (org.role !== "owner" && org.role !== "admin")
    return {
      sessionId: null,
      checkoutError: "Only organization owners and admins can manage billing.",
    }

  const members = await fetchQuery(
    api.organizations.listMembers,
    { orgId: org._id },
    { token },
  )
  const orgMembersCount = members.length
  if (!orgMembersCount)
    return {
      sessionId: null,
      checkoutError: "Organization members count not found.",
    }

  const emailAddress = viewer.email
  if (!emailAddress)
    return {
      sessionId: null,
      checkoutError:
        "You must have an email address to create a checkout session.",
    }

  const billing = await fetchQuery(
    api.billing.getForOrg,
    { orgId: org._id },
    { token },
  )

  const origin = getOrigin()
  const stripeSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      { ...lineItem, quantity: type === "tiered" ? orgMembersCount : 1 },
    ],
    billing_address_collection: "required",
    tax_id_collection: {
      enabled: true,
    },
    success_url: `${origin}/org/${org.slug}/billing`,
    cancel_url: `${origin}/pricing`,
    customer: billing?.stripeCustomerId ?? undefined,
    customer_email: billing?.stripeCustomerId ? undefined : emailAddress,
    subscription_data: {
      metadata: {
        userId: viewer._id,
        orgId: org._id,
      },
    },
    metadata: {
      orgId: org._id,
      userId: viewer._id,
    },
  })

  return {
    sessionId: stripeSession.id,
    checkoutError: null,
  }
}
