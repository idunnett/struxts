"use server"

import Stripe from "stripe"
import { env } from "../../../../../../env"

const stripe = new Stripe(env.STRIPE_SECRET_KEY)

// Action for setting a default payment method
export async function setDefaultPaymentMethodAction({
  paymentMethodId,
  customerId,
}: {
  paymentMethodId: string
  customerId: string
}) {
  try {
    // Attach the payment method to the customer (if not already attached)
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    })

    // Set the payment method as the default
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Error setting default payment method:", error)
    return { success: false, error: "Failed to set default payment method" }
  }
}

export async function deletePaymentMethodAction({
  paymentMethodId,
}: {
  paymentMethodId: string
}) {
  try {
    // Detach the payment method from the customer
    const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId)

    return { success: true, paymentMethod }
  } catch (error) {
    console.error("Error deleting payment method:", error)
    return { success: false, error: "Failed to delete payment method" }
  }
}
