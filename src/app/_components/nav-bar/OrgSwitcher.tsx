"use client"

import { ClerkLoaded, ClerkLoading, OrganizationSwitcher } from "@clerk/nextjs"
import { Skeleton } from "../../../components/ui/skeleton"

export default function OrgSwitcher() {
  return (
    <>
      <ClerkLoading>
        <Skeleton className="h-7 w-52 rounded-md" />
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
