import Stripe from "stripe"

interface Props {
  customer: Stripe.Customer
}

export default function BillingInformation({ customer }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <span className="border-b pb-2 text-xs font-normal text-muted-foreground">
        BILLING INFORMATION
      </span>
      <div className="grid grid-cols-8 gap-x-8 gap-y-2">
        <span className="col-span-3 text-muted-foreground">Name</span>
        <span className="col-span-5">{customer.name}</span>
        <span className="col-span-3 text-muted-foreground">Address</span>
        <div className="col-span-5 flex flex-wrap gap-1">
          {customer.address?.line1 && <span>{customer.address?.line1}</span>}
          {customer.address?.line2 && <span>{customer.address?.line2}</span>}
          {customer.address?.city && customer.address.state && (
            <span>
              {customer.address?.city}, {customer.address?.state}
            </span>
          )}
          {customer.address?.postal_code && (
            <span>{customer.address?.postal_code}</span>
          )}
          {customer.address?.country && (
            <span>{customer.address?.country}</span>
          )}
        </div>
      </div>
      {/* <Button
        variant="ghost"
        size="sm"
        className="w-min gap-2 text-muted-foreground hover:text-foreground"
      >
        <LucidePencil size={14} />
        Update Information
      </Button> */}
    </div>
  )
}
