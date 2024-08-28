"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { usePostHog } from "posthog-js/react"
import { useEffect } from "react"

export default function PostHogPageView(): null {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const posthog = usePostHog()
  useEffect(() => {
    if (process.env.VERCEL_ENV !== "production") return
    if (pathname && posthog) {
      // Track pageviews
      let url = window.origin + pathname
      if (searchParams.toString()) {
        url = url + `?${searchParams.toString()}`
      }
      posthog.capture("$pageview", {
        $current_url: url,
      })
    }
  }, [pathname, searchParams, posthog])

  return null
}
