"use client"

import { useQuery } from "convex/react"
import { useParams } from "next/navigation"
import { api } from "../../convex/_generated/api"

/** Active org from URL slug when present, otherwise the user's saved active org. */
export function useCurrentOrg() {
  const params = useParams() as { orgSlug?: string }
  const viewer = useQuery(api.users.viewer)
  const orgBySlug = useQuery(
    api.organizations.getBySlug,
    params.orgSlug ? { slug: params.orgSlug } : "skip",
  )

  if (params.orgSlug) {
    return {
      org: orgBySlug ?? null,
      orgId: orgBySlug?._id ?? null,
      orgSlug: params.orgSlug,
      role: orgBySlug?.role ?? null,
      isLoaded: orgBySlug !== undefined,
      viewer,
    }
  }

  const active = viewer?.activeOrganization ?? null
  return {
    org: active,
    orgId: active?._id ?? null,
    orgSlug: active?.slug ?? null,
    role: active?.role ?? null,
    isLoaded: viewer !== undefined,
    viewer,
  }
}
