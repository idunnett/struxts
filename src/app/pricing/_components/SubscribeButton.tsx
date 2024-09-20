"use client"

import { loadStripe } from "@stripe/stripe-js"
import { toast } from "sonner"
import Stripe from "stripe"
import { Button } from "../../../components/ui/button"
import { env } from "../../../env"
import { createStripeCheckoutSession } from "./actions"

interface Props {
  product: Stripe.Product & { default_price: Stripe.Price }
  subscribed?: boolean
}

const stripePromise = loadStripe(env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY)

export default function SubscribeButton({ product, subscribed }: Props) {
  async function handleCheckout() {
    try {
      const stripe = await stripePromise
      if (!stripe) throw new Error("Failed to load stripe")

      const { sessionId, checkoutError } = await createStripeCheckoutSession(
        {
          price: product.default_price.id,
          quantity:
            product.default_price.billing_scheme === "per_unit" ? 1 : undefined,
        },
        product.default_price.billing_scheme,
      )

      if (!sessionId || checkoutError)
        throw new Error(checkoutError || "Failed to create checkout session.")

      const { error } = await stripe.redirectToCheckout({
        sessionId,
      })
      if (error) throw error
    } catch (error: any) {
      toast.error(error?.message || "Failed to create checkout session.")
    }
  }

  return (
    <Button disabled={subscribed} className="w-full" onClick={handleCheckout}>
      Subscribe{subscribed ? "d" : ""}
    </Button>
  )
}
