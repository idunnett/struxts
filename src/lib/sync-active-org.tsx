"use client"

import { useAuth, useOrganizationList } from "@clerk/nextjs"
import { useParams } from "next/navigation"
import { useEffect } from "react"

export function SyncActiveOrganization() {
  const { setActive, isLoaded } = useOrganizationList()

  // Get the organization ID from the session
  const { orgSlug } = useAuth()

  // Get the organization ID from the URL
  const { orgSlug: urlOrgSlug } = useParams() as { orgSlug: string }

  useEffect(() => {
    if (!isLoaded) return

    // If the org ID in the URL is not the same as the org ID in the session (the active organization), set the active organization to be the org ID from the URL
    if (urlOrgSlug && urlOrgSlug !== orgSlug) {
      if (urlOrgSlug.startsWith("user_")) setActive({ organization: null })
      else void setActive({ organization: orgSlug })
    }
  }, [orgSlug, isLoaded, setActive, urlOrgSlug])

  return null
}
