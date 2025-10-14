"use client"

import { LucideExternalLink } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import Spinner from "../../../../../../components/Spinner"
import { Button } from "../../../../../../components/ui/button"
import { createCustomerPortalSession } from "./actions"

interface Props {
  orgId: string
  customerId: string
}

export default function ManageBillingButton({ orgId, customerId }: Props) {
  const [loading, setLoading] = useState(false)

  const handleRedirect = async () => {
    setLoading(true)

    const response = await createCustomerPortalSession({
      orgId,
      customerId,
    })

    if (response.success && response.url) {
      window.location.href = response.url // Redirect to Stripe portal
    } else {
      toast.error("Failed to redirect to the customer portal")
    }

    setLoading(false)
  }

  return (
    <Button onClick={handleRedirect}>
      {loading ? (
        <Spinner className="mr-2" />
      ) : (
        <LucideExternalLink className="mr-2 h-4 w-4" />
      )}
      Manage Billing
    </Button>
  )
}
