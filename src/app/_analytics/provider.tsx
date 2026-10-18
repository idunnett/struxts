"use client"

import { useQuery } from "convex/react"
import posthog from "posthog-js"
import { PostHogProvider } from "posthog-js/react"
import { useEffect } from "react"
import { api } from "../../../convex/_generated/api"
import { env } from "../../env"

if (
  typeof window !== "undefined" &&
  process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
) {
  posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: "/ingest",
    person_profiles: "identified_only",
    capture_pageview: false,
    ui_host: "https://us.posthog.com",
  })
}

export function PHProvider({ children }: { children: React.ReactNode }) {
  if (process.env.NEXT_PUBLIC_VERCEL_ENV !== "production") return children
  return (
    <PostHogProvider client={posthog}>
      <PostHogAuthWrapper>{children}</PostHogAuthWrapper>
    </PostHogProvider>
  )
}

function PostHogAuthWrapper({ children }: { children: React.ReactNode }) {
  const viewer = useQuery(api.users.viewer)

  useEffect(() => {
    if (viewer)
      posthog.identify(viewer._id, {
        email: viewer.email,
        name: viewer.name,
      })
    else if (viewer === null) posthog.reset()
  }, [viewer])

  return children
}
