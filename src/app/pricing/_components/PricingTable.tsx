"use client"

import { useAuth, useOrganization } from "@clerk/nextjs"
import Link from "next/link"
import Stripe from "stripe"
import FreePlanFeatureList from "../../../components/FreePlanFeatureList"
import { Button } from "../../../components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card"
import { convertFromSubcurrency } from "../../../lib/currencyUtils"
import { cn } from "../../../lib/utils"
import SubscribeButton from "./SubscribeButton"

interface Props {
  products: (Stripe.Product & {
    default_price: Stripe.Price
  })[]
  prices: (Stripe.Price & { tiers?: Stripe.Price.Tier[] })[]
  currentPlanProductId: string | undefined
}

export function PricingTable({
  products,
  prices,
  currentPlanProductId,
}: Props) {
  const session = useAuth()
  const organization = useOrganization()

  const isFreePlan =
    organization.isLoaded &&
    organization.organization?.publicMetadata?.plan === undefined

  return (
    <div className="flex h-96 w-full gap-2">
      <Card className="h-full flex-1">
        <CardHeader>
          <CardTitle className="text-base">Free Plan</CardTitle>
          <CardDescription className="h-8">
            Start building for free
            {session.isSignedIn && organization.organization && isFreePlan && (
              <span className="font-normal text-muted-foreground">
                {" "}
                (Current)
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex h-28 flex-col justify-end gap-2">
          <div className="flex items-center gap-1">
            <h5 className="text-3xl font-extrabold">CA $0</h5>
          </div>
          {session.isSignedIn && organization.organization && !isFreePlan ? (
            <Button className="w-full" asChild>
              <Link href={`/org/${organization.organization.slug}/billing`}>
                Cancel my plan
              </Link>
            </Button>
          ) : (
            <Button className="w-full" asChild>
              <Link href={session.userId ? "/org" : "/sign-in"}>
                Get started for free
              </Link>
            </Button>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-1">
          <span className="text-sm text-muted-foreground">This includes:</span>
          <FreePlanFeatureList />
        </CardFooter>
      </Card>
      {products.map((product) => {
        const price = prices.find((price) => price.product === product.id)
        const tier = price?.tiers?.[0]
        let productName = product.name
        if (productName.startsWith("Struxts - "))
          productName = productName.slice(9)
        let tierPriceString = ""
        if (tier) {
          if (tier.flat_amount && tier.unit_amount)
            tierPriceString = `$${convertFromSubcurrency(tier.flat_amount)} + $${convertFromSubcurrency(tier.unit_amount)} per member`
        }
        return (
          <Card key={product.id} className="h-full flex-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                {productName}
                {currentPlanProductId === product.id && (
                  <span className="font-normal text-muted-foreground">
                    (Current)
                  </span>
                )}
              </CardTitle>
              <CardDescription className="h-8">
                {product.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex h-28 flex-col justify-end gap-2">
              <div className="flex items-end gap-1">
                <h5
                  className={cn(
                    "flex items-end gap-2 font-extrabold",
                    price?.billing_scheme === "tiered" ? "text-lg" : "text-3xl",
                  )}
                >
                  <span className="text-3xl">CA</span>
                  <span
                    className={cn(
                      price?.billing_scheme === "tiered" && "leading-4",
                    )}
                  >
                    {price?.billing_scheme === "tiered"
                      ? tierPriceString
                      : `$${convertFromSubcurrency(product.default_price.unit_amount ?? 0)}`}
                  </span>
                </h5>
                <span className="w-min text-xs leading-none text-muted-foreground">
                  per month
                </span>
              </div>
              <SubscribeButton
                product={product}
                subscribed={currentPlanProductId === product.id}
              />
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-1">
              <span className="text-sm text-muted-foreground">
                This includes:
              </span>
              <ul className="space-y-1 pl-4">
                {product.marketing_features.map((feature, index) => (
                  <li key={index} className="list-item list-disc text-sm">
                    {feature.name}
                  </li>
                ))}
              </ul>
            </CardFooter>
          </Card>
        )
      })}
      {/* <Card className="h-96 flex-1">
        <CardHeader>
          <CardTitle className="text-base">Enterprise</CardTitle>
          <CardDescription className="h-8">
            A custom plan for large organizations
          </CardDescription>
        </CardHeader>
        <CardContent className="flex h-28 flex-col justify-end gap-2">
          <Button className="w-full">Contact us for pricing</Button>
        </CardContent>
      </Card> */}
    </div>
  )
}
