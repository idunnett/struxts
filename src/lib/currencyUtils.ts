import type Stripe from "stripe"

export function convertToSubcurrency(amount: number, factor = 100) {
  return Math.round(amount * factor)
}

export function convertFromSubcurrency(amount: number, factor = 100) {
  return amount / factor
}

/** Stripe API 2025+: period end lives on subscription items, not the subscription. */
export function getSubscriptionPeriodEnd(
  subscription: Stripe.Subscription,
): number | undefined {
  return subscription.items.data[0]?.current_period_end
}
