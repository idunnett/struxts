"use client"

import { useMutation, useQuery } from "convex/react"
import { useParams } from "next/navigation"
import { useEffect } from "react"
import { api } from "../../convex/_generated/api"

/** Keep the user's active organization aligned with the URL org slug. */
export function SyncActiveOrganization() {
  const { orgSlug: urlOrgSlug } = useParams() as { orgSlug?: string }
  const viewer = useQuery(api.users.viewer)
  const orgBySlug = useQuery(
    api.organizations.getBySlug,
    urlOrgSlug ? { slug: urlOrgSlug } : "skip",
  )
  const setActiveBySlug = useMutation(api.organizations.setActiveBySlug)

  useEffect(() => {
    if (!urlOrgSlug || viewer === undefined || orgBySlug === undefined) return
    if (viewer === null) return
    if (viewer.activeOrganization?.slug === urlOrgSlug) return
    // Stale URL after a slug rename (or unknown slug) — don't sync.
    if (orgBySlug === null) return
    void setActiveBySlug({ slug: urlOrgSlug })
  }, [urlOrgSlug, viewer, orgBySlug, setActiveBySlug])

  return null
}
