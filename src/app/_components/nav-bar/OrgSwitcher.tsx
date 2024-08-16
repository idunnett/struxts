"use client"

import { ClerkLoaded, ClerkLoading, OrganizationSwitcher } from "@clerk/nextjs"

export default function OrgSwitcher() {
  return (
    <>
      <ClerkLoading>
        <div className="h-6 w-80 animate-pulse rounded-md bg-muted" />
      </ClerkLoading>
      <ClerkLoaded>
        <OrganizationSwitcher
          afterSelectOrganizationUrl={(org) => `/org/${org.slug}/structures`}
          afterSelectPersonalUrl={(user) => `/org/${user.id}/structures`}
        />
      </ClerkLoaded>
    </>
  )
}
