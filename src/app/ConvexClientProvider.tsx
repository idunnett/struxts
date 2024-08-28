"use client"

import { ClerkProvider, useAuth } from "@clerk/clerk-react"
import { ConvexReactClient } from "convex/react"
import { ConvexProviderWithClerk } from "convex/react-clerk"
import { ReactNode } from "react"
import { env } from "../env"

const convex = new ConvexReactClient(env.NEXT_PUBLIC_CONVEX_URL)

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      signInFallbackRedirectUrl="/"
      publishableKey={env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}
