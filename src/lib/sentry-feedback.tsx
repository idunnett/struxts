"use client"

import * as Sentry from "@sentry/nextjs"
import { useConvexAuth } from "convex/react"
import { useEffect, useState } from "react"

function createWidget() {
  return Sentry.feedbackIntegration()?.createWidget({
    colorScheme: "light",
    showBranding: false,
  })
}

function useFeedbackWidget(shouldMount: boolean) {
  const [widget, setWidget] = useState<ReturnType<typeof createWidget> | null>(
    null,
  )
  useEffect(() => {
    if (shouldMount && !widget) {
      const newWidget = createWidget()
      setWidget(newWidget)
    }

    if (!shouldMount && widget) {
      widget.removeFromDom()
      setWidget(null)
    }
  }, [shouldMount, widget])
}

export default function SentryFeedbackWidget() {
  const { isAuthenticated } = useConvexAuth()
  useFeedbackWidget(
    isAuthenticated && process.env.NEXT_PUBLIC_VERCEL_ENV === "production",
  )

  return null
}
