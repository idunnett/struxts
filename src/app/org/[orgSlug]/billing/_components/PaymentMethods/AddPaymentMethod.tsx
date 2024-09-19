"use client"

import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { useEffect, useRef, useState } from "react"
import Spinner from "../../../../../../components/Spinner"
import {
  DialogDescription,
  DialogTitle,
} from "../../../../../../components/ui/dialog"
import { env } from "../../../../../../env"
import PaymentMethodForm from "./PaymentMethodForm"

const stripePromise = loadStripe(env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY)

interface Props {
  customerId: string
}

export default function AddPaymentMethod({ customerId }: Props) {
  const initialized = useRef(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    // Fetch the SetupIntent client secret from your API route
    fetch("/api/create-setup-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId }), // Replace with actual customer ID
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret))
      .catch((error) => console.error("Error fetching client secret:", error))
  }, [])

  return (
    <div className="flex h-full w-full flex-col items-start gap-8 p-8">
      <DialogTitle>Add payment method</DialogTitle>
      <DialogDescription hidden>
        Add a payment method to start your subscription.
      </DialogDescription>
      {clientSecret ? (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
          }}
        >
          <PaymentMethodForm />
        </Elements>
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <Spinner />
        </div>
      )}
    </div>
  )
}
