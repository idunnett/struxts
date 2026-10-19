import { fetchQuery } from "convex/nextjs"
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
import { api } from "../../../../../convex/_generated/api"
import { env } from "../../../../env"
import {
  convertFromSubcurrency,
  getSubscriptionPeriodEnd,
} from "../../../../lib/currencyUtils"
import { cn } from "../../../../lib/utils"
import { getAuthToken } from "../../../auth"
import BillingInformation from "./_components/BillingInformation"
import ManageBillingButton from "./_components/ManageBillingButton"
import PaymentMethods from "./_components/PaymentMethods"

const stripe = new Stripe(env.STRIPE_SECRET_KEY)

interface Props {
  params: Promise<{ orgSlug: string }>
}

export default async function BillingPage({ params }: Props) {
  const { orgSlug } = await params
  const token = await getAuthToken()
  const org = await fetchQuery(
    api.organizations.getBySlug,
    { slug: orgSlug },
    { token },
  )

  if (!org)
    return <ErrorDisplay message="Organization not found" statusCode={404} />

  const billing = await fetchQuery(
    api.billing.getForOrg,
    { orgId: org._id },
    { token },
  )

  const customerId = billing?.stripeCustomerId ?? undefined
  let customer: Stripe.Customer | Stripe.DeletedCustomer | null = null
  let paymentMethods: Stripe.ApiList<Stripe.PaymentMethod> | undefined
  if (customerId) {
    try {
      const stripeCustomer = await stripe.customers.retrieve(customerId)
      if (!stripeCustomer.deleted) customer = stripeCustomer
    } catch (error) {
      console.error("Error fetching customer:", error)
    }
  }
  let subscription: Stripe.Subscription | undefined
  if (customer) {
    paymentMethods = await stripe.paymentMethods.list({
      customer: customer.id,
    })
    subscription = (
      await stripe.subscriptions.search({
        query: `metadata["orgId"]:"${org._id}" AND status:"active"`,
      })
    ).data?.[0]
  }

  const currentPlanProductId = billing?.stripeProductId
  let product:
    | (Stripe.Product & {
        default_price: Stripe.Price
      })
    | undefined
  let price: (Stripe.Price & { tiers?: Stripe.Price.Tier[] }) | undefined
  if (currentPlanProductId && subscription) {
    try {
      product = (await stripe.products.retrieve(currentPlanProductId, {
        expand: ["default_price"],
      })) as Stripe.Product & {
        default_price: Stripe.Price
      }
    } catch (error) {
      console.error("Error fetching product:", error)
    }

    if (product)
      price = (await stripe.prices.retrieve(product.default_price.id, {
        expand: ["tiers"],
      })) as Stripe.Price & { tiers?: Stripe.Price.Tier[] }
  }

  const tier = price?.tiers?.[0]
  let productName = product?.name ?? "Free Plan"
  if (productName.startsWith("Struxts - ")) productName = productName.slice(9)
  let tierPriceString = ""
  if (tier) {
    if (tier.flat_amount && tier.unit_amount)
      tierPriceString = `$${convertFromSubcurrency(tier.flat_amount)} + $${convertFromSubcurrency(tier.unit_amount)} per member`
  }

  return (
    <div className="container mx-auto flex h-full w-full flex-col items-center gap-4 overflow-auto py-8 lg:px-28">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex justify-between gap-3 text-base">
            <div className="relative flex h-1/6 items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-800 sm:text-4xl">
                Billing -
              </h1>
              <div className="flex items-center gap-4">
                {org.imageUrl ? (
                  <Image
                    src={org.imageUrl}
                    alt={org.name}
                    width={40}
                    height={40}
                    className="rounded-md"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-sm font-bold text-primary">
                    {org.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <h1 className="text-2xl font-bold sm:text-4xl">{org.name}</h1>
              </div>
            </div>
            {customer && (
              <ManageBillingButton
                orgSlug={org.slug}
                orgId={org._id}
                customerId={customer.id}
              />
            )}
          </CardTitle>
          <CardDescription>{product?.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-16">
          <div className="flex flex-col gap-2">
            <span className="border-b pb-2 text-xs font-normal text-muted-foreground">
              CURRENT PLAN
            </span>
            {subscription && getSubscriptionPeriodEnd(subscription) && (
              <Badge variant="secondary" className="w-min whitespace-nowrap">
                {subscription.cancel_at_period_end ? "Cancels on" : "Renews on"}{" "}
                {formatDate(
                  new Date(getSubscriptionPeriodEnd(subscription)! * 1000),
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
            </div>
            {subscription && getSubscriptionPeriodEnd(subscription) && (
              <div className="flex items-center gap-2 pt-4">
                <LucideCalendarDays size={14} />
                <span>
                  Your plan will be{" "}
                  {subscription.cancel_at_period_end
                    ? "canceled on"
                    : "renewed on"}{" "}
                  {formatDate(
                    new Date(getSubscriptionPeriodEnd(subscription)! * 1000),
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
