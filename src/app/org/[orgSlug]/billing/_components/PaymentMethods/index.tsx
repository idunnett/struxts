"use client"

import { LucideEllipsisVertical, LucidePlus, LucideX } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import Stripe from "stripe"
import Spinner from "../../../../../../components/Spinner"
import { Badge } from "../../../../../../components/ui/badge"
import { Button } from "../../../../../../components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "../../../../../../components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../../../../components/ui/popover"
import { cn } from "../../../../../../lib/utils"
import {
  deletePaymentMethodAction,
  setDefaultPaymentMethodAction,
} from "./actions"
import AddPaymentMethod from "./AddPaymentMethod"

interface Props {
  customer: Stripe.Customer
  paymentMethods: Stripe.PaymentMethod[]
}

export default function PaymentMethods({ customer, paymentMethods }: Props) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleMakePaymentMethodDefault(paymentMethodId: string) {
    startTransition(async () => {
      await setDefaultPaymentMethodAction({
        customerId: customer.id,
        paymentMethodId,
      })
      router.refresh()
    })
  }

  function handleDeletePaymentMethod(paymentMethodId: string) {
    startTransition(async () => {
      await deletePaymentMethodAction({ paymentMethodId })
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="border-b pb-2 text-xs font-normal text-muted-foreground">
        PAYMENT METHODS
      </span>
      <div className="relative flex flex-col gap-2">
        {isPending && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Spinner />
          </div>
        )}
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={cn(
              "flex items-center justify-between gap-8",
              isPending && "opacity-10",
            )}
          >
            <div className="flex items-center gap-2">
              <span>{method.card?.brand}</span>
              <span>****{method.card?.last4}</span>
              {method.id ===
                customer.invoice_settings.default_payment_method && (
                <Badge variant="secondary">Default</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {method.card && (
                <span className="text-sm">
                  Expires {method.card.exp_month.toString().padStart(2, "0")}/
                  {method.card.exp_year}
                </span>
              )}
              {method.id ===
              customer.invoice_settings.default_payment_method ? (
                <button disabled className="text-muted-foreground">
                  <LucideX size={16} />
                </button>
              ) : (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      disabled={isPending}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <LucideEllipsisVertical size={16} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="flex w-min flex-col p-1"
                    align="start"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 justify-start text-xs"
                      disabled={isPending}
                      onClick={() => handleMakePaymentMethodDefault(method.id)}
                    >
                      Make Default
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isPending}
                      className="h-8 justify-start text-xs"
                      onClick={() => handleDeletePaymentMethod(method.id)}
                    >
                      Delete
                    </Button>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>
        ))}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={isPending}
              className={cn(
                "w-min gap-2 text-muted-foreground hover:text-foreground",
                isPending && "opacity-10",
              )}
            >
              <LucidePlus size={14} />
              Add payment method
            </Button>
          </DialogTrigger>
          <DialogContent forceMount>
            <AddPaymentMethod customerId={customer.id} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
