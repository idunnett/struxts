import { auth, clerkClient } from "@clerk/nextjs/server"
import Image from "next/image"
import Stripe from "stripe"
import { env } from "../../env"
import { PricingTable } from "./_components/PricingTable"

const stripe = new Stripe(env.STRIPE_SECRET_KEY)

export default async function PricingPage() {
  const session = auth()

  const org = session.orgId
    ? await clerkClient().organizations.getOrganization({
        organizationId: session.orgId,
      })
    : undefined
  const products = (
    await stripe.products.list({
      expand: ["data.default_price"],
      active: true,
    })
  ).data as (Stripe.Product & {
    default_price: Stripe.Price
  })[]

  products.sort((a, b) => {
    if (a.default_price?.billing_scheme !== b.default_price?.billing_scheme)
      return a.default_price?.billing_scheme === "per_unit" ? -1 : 1

    return (
      (a.default_price?.unit_amount ?? 0) - (b.default_price?.unit_amount ?? 0)
    )
  })

  let prices: (Stripe.Price & { tiers?: Stripe.Price.Tier[] })[] = []
  for (const product of products) {
    const price = (await stripe.prices.retrieve(product.default_price.id, {
      expand: ["tiers"], // To get tiered pricing details, if applicable
    })) as Stripe.Price & { tiers?: Stripe.Price.Tier[] }
    prices.push({ ...price })
  }

  let subscription: Stripe.Subscription | undefined
  const customerId = org?.publicMetadata?.customer as string | undefined
  if (org && customerId) {
    try {
      subscription = (
        await stripe.subscriptions.search({
          query: `metadata["orgId"]:"${org.id}" AND status:"active"`,
        })
      ).data?.[0]
    } catch (error) {
      console.error("Error fetching customer:", error)
    }
  }

  let currentPlanProducId: string | undefined
  if (subscription)
    currentPlanProducId = products.find(
      (product) => product.id === (org?.publicMetadata?.plan as any)?.product,
    )?.id

  return (
    <div className="container mx-auto flex h-full w-full flex-col items-center lg:px-28">
      <div className="relative flex h-1/6 items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800 sm:text-4xl">
          Pricing{org && " -"}
        </h1>
        {org && (
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
        )}
      </div>
      <PricingTable
        products={products}
        prices={prices}
        currentPlanProductId={currentPlanProducId}
      />
    </div>
  )
}
