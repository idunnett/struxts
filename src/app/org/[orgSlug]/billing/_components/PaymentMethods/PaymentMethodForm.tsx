import { useOrganization } from "@clerk/nextjs"
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { FormEvent, useState } from "react"
import { toast } from "sonner"
import Spinner from "../../../../../../components/Spinner"
import { Button } from "../../../../../../components/ui/button"

export default function PaymentMethodForm() {
  const stripe = useStripe()
  const elements = useElements()
  const org = useOrganization()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!stripe || !elements || !org.organization) return

    const origin = process.env.VERCEL_URL ?? "http://localhost:3000"
    setLoading(true)
    // Confirm the SetupIntent to attach the payment method to the customer
    const { error } = await stripe.confirmSetup({
      elements,
      confirmParams: {
        return_url: `${origin}/org/${org.organization.slug}/billing`, // Optional
      },
    })

    if (error) {
      toast.error(error.message ?? "Failed to add payment method.")
      console.error(error)
    } else toast.success("Payment method added successfully!")
    setLoading(false)
  }

  return (
    <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit}>
      <PaymentElement />
      <Button className="w-min" type="submit" disabled={!stripe || loading}>
        {loading && <Spinner className="mr-2" />}
        Add Payment Method
      </Button>
    </form>
  )
}
