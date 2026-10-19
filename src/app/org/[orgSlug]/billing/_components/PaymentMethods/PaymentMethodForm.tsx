import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { FormEvent, useState } from "react"
import { toast } from "sonner"
import Spinner from "../../../../../../components/Spinner"
import { Button } from "../../../../../../components/ui/button"
import { useCurrentOrg } from "~/hooks/useCurrentOrg"
import { getOrigin } from "../../../../../../lib/utils"

export default function PaymentMethodForm() {
  const stripe = useStripe()
  const elements = useElements()
  const { org } = useCurrentOrg()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!stripe || !elements || !org) return

    const origin = getOrigin()
    setLoading(true)
    const { error } = await stripe.confirmSetup({
      elements,
      confirmParams: {
        return_url: `${origin}/org/${org.slug}/billing`,
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
