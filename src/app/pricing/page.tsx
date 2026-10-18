import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server"
import { fetchQuery } from "convex/nextjs"
import Image from "next/image"
import Stripe from "stripe"
import { api } from "../../../convex/_generated/api"
import { env } from "../../env"
import { PricingTable } from "./_components/PricingTable"

const stripe = new Stripe(env.STRIPE_SECRET_KEY)

export default async function PricingPage() {
  const token = await convexAuthNextjsToken()
  const viewer = token
    ? await fetchQuery(api.users.viewer, {}, { token })
    : null
  const org = viewer?.activeOrganization ?? null

  const billing =
    org && token
      ? await fetchQuery(api.billing.getForOrg, { orgId: org._id }, { token })
      : null

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

  const prices = await Promise.all(
    products.map(
      (product) =>
        stripe.prices.retrieve(product.default_price.id, {
          expand: ["tiers"],
        }) as Promise<Stripe.Price & { tiers?: Stripe.Price.Tier[] }>,
    ),
  )

  let subscription: Stripe.Subscription | undefined
  if (org && billing?.stripeCustomerId) {
    try {
      subscription = (
        await stripe.subscriptions.search({
          query: `metadata["orgId"]:"${org._id}" AND status:"active"`,
        })
      ).data?.[0]
    } catch (error) {
      console.error("Error fetching subscription:", error)
    }
  }

  let currentPlanProductId: string | undefined
  if (subscription || billing?.stripeProductId)
    currentPlanProductId = products.find(
      (product) =>
        product.id ===
        (billing?.stripeProductId ??
          subscription?.items.data[0]?.price.product),
    )?.id

  return (
    <div className="container mx-auto flex h-full w-full flex-col items-center lg:px-28">
      <div className="relative flex h-1/6 items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800 sm:text-4xl">
          Pricing{org && " -"}
        </h1>
        {org && (
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
        )}
      </div>
      <PricingTable
        products={products}
        prices={prices}
        currentPlanProductId={currentPlanProductId}
        orgSlug={org?.slug}
        isSignedIn={!!viewer}
      />
    </div>
  )
}
