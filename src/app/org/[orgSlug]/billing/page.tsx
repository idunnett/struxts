import { auth, clerkClient } from "@clerk/nextjs/server"
import { formatDate } from "date-fns"
import { LucideCalendarDays, LucideChevronDown } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import Stripe from "stripe"
import ErrorDisplay from "../../../../components/ErrorDisplay"
import FreePlanFeatureList from "../../../../components/FreePlanFeatureList"
import { Badge } from "../../../../components/ui/badge"
import { Button } from "../../../../components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../../components/ui/collapsible"
import { env } from "../../../../env"
import { convertFromSubcurrency } from "../../../../lib/currencyUtils"
import { cn } from "../../../../lib/utils"
import BillingInformation from "./_components/BillingInformation"
import PaymentMethods from "./_components/PaymentMethods"

const stripe = new Stripe(env.STRIPE_SECRET_KEY)

export default async function BillingPage() {
  const session = auth()

  const org = session.orgId
    ? await clerkClient().organizations.getOrganization({
        organizationId: session.orgId,
      })
    : undefined

  if (!org)
    return <ErrorDisplay message="Organization not found" statusCode={404} />

  const currentPlanProductId = (org?.publicMetadata?.plan as any)?.product as
    | string
    | undefined
  let product:
    | (Stripe.Product & {
        default_price: Stripe.Price
      })
    | undefined
  let price: (Stripe.Price & { tiers?: Stripe.Price.Tier[] }) | undefined
  if (currentPlanProductId)
    product = (await stripe.products.retrieve(currentPlanProductId, {
      expand: ["default_price"],
    })) as Stripe.Product & {
      default_price: Stripe.Price
    }

  if (product)
    price = (await stripe.prices.retrieve(product.default_price.id, {
      expand: ["tiers"], // To get tiered pricing details, if applicable
    })) as Stripe.Price & { tiers?: Stripe.Price.Tier[] }

  const tier = price?.tiers?.[0]
  let productName = product?.name ?? "Free Plan"
  if (productName.startsWith("Struxts - ")) productName = productName.slice(9)
  let tierPriceString = ""
  if (tier) {
    if (tier.flat_amount && tier.unit_amount)
      tierPriceString = `$${convertFromSubcurrency(tier.flat_amount)} + $${convertFromSubcurrency(tier.unit_amount)} per member`
  }

  const customerId = org.publicMetadata?.customer as string | undefined
  let customer: Stripe.Customer | Stripe.DeletedCustomer | null = null
  let paymentMethods: Stripe.ApiList<Stripe.PaymentMethod> | undefined
  if (customerId) {
    const stripeCustomer = await stripe.customers.retrieve(customerId)
    if (!stripeCustomer.deleted) customer = stripeCustomer
  }
  let subscription: Stripe.Subscription | undefined
  if (customer) {
    paymentMethods = await stripe.paymentMethods.list({
      customer: customer.id,
    })
    subscription = (
      await stripe.subscriptions.search({
        query: `metadata["orgId"]:"${org.id}" AND status:"active"`,
      })
    ).data?.[0]
  }

  return (
    <div className="container mx-auto flex h-full w-full flex-col items-center gap-4 overflow-auto py-8 lg:px-28">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex flex-col gap-3 text-base">
            <div className="relative flex h-1/6 items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-800 sm:text-4xl">
                Billing -
              </h1>
              <div className="flex items-center gap-4">
                <Image
                  src={org.imageUrl}
                  alt={org.name}
                  width={40}
                  height={40}
                  className="rounded-md"
                />
                <h1 className="text-2xl font-bold sm:text-4xl">{org.name}</h1>
              </div>
            </div>
          </CardTitle>
          <CardDescription>{product?.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-16">
          <div className="flex flex-col gap-2">
            <span className="border-b pb-2 text-xs font-normal text-muted-foreground">
              CURRENT PLAN
            </span>
            {subscription && (
              <Badge variant="secondary" className="w-min whitespace-nowrap">
                {subscription.cancel_at_period_end ? "Cancels on" : "Renews on"}{" "}
                {formatDate(
                  new Date(subscription.current_period_end * 1000),
                  "MMM dd",
                )}
              </Badge>
            )}
            <span>{productName}</span>
            <div className="flex items-end gap-1 py-2">
              <h5
                className={cn(
                  "flex items-end gap-2 font-extrabold",
                  price?.billing_scheme === "tiered" ? "text-lg" : "text-3xl",
                )}
              >
                <span className="text-3xl">CA</span>
                <span
                  className={cn(
                    price?.billing_scheme === "tiered" && "w-36 leading-4",
                  )}
                >
                  {price?.billing_scheme === "tiered"
                    ? tierPriceString
                    : `$${convertFromSubcurrency(product?.default_price.unit_amount ?? 0)}`}
                </span>
              </h5>
              <span className="w-min text-xs leading-none text-muted-foreground">
                per month
              </span>
            </div>
            <Collapsible className="pb-4">
              <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                View Details
                <LucideChevronDown size={16} />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="flex flex-col items-start gap-2 py-2">
                  <span className="text-sm text-muted-foreground">
                    This includes:
                  </span>
                  {product ? (
                    <ul className="space-y-1 pl-4">
                      {product?.marketing_features.map((feature, index) => (
                        <li key={index} className="list-item list-disc text-sm">
                          {feature.name}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <FreePlanFeatureList />
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
            <div className="flex items-center gap-2">
              <Button asChild>
                <Link href="/pricing">Change Plan</Link>
              </Button>
              {subscription && (
                <Button variant="outline">
                  {subscription.cancel_at_period_end ? "Renew" : "Cancel"} Plan
                </Button>
              )}
            </div>
            {subscription && (
              <div className="flex items-center gap-2 pt-4">
                <LucideCalendarDays size={14} />
                <span>
                  Your plan will be{" "}
                  {subscription.cancel_at_period_end
                    ? "canceled on"
                    : "renewed on"}{" "}
                  {formatDate(
                    new Date(subscription.current_period_end * 1000),
                    "MMM dd, yyyy",
                  )}
                </span>
              </div>
            )}
          </div>
          {paymentMethods && customer && (
            <PaymentMethods
              customer={customer}
              paymentMethods={paymentMethods.data}
            />
          )}
          {customer && <BillingInformation customer={customer} />}
        </CardContent>
      </Card>
    </div>
  )
}
