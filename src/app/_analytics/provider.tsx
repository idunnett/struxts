// app/providers.js
"use client"
import { useUser } from "@clerk/nextjs"
import posthog from "posthog-js"
import { PostHogProvider } from "posthog-js/react"
import { useEffect } from "react"
import { env } from "../../env"

if (typeof window !== "undefined") {
  posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: "/ingest",
    person_profiles: "identified_only",
    capture_pageview: false, // Disable automatic pageview capture, as we capture manually
    ui_host: "https://us.posthog.com",
  })
}

export function PHProvider({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider client={posthog}>
      <PostHogAuthWrapper>{children}</PostHogAuthWrapper>
    </PostHogProvider>
  )
}

function PostHogAuthWrapper({ children }: { children: React.ReactNode }) {
  const user = useUser()

  useEffect(() => {
    if (user.isSignedIn)
      posthog.identify(user.user.id, {
        email: user.user.primaryEmailAddress,
        name: user.user.fullName,
        image: user.user.imageUrl,
      })
    else posthog.reset()
  }, [user])

  return children
}
