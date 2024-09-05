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
          hidePersonal
          afterSelectOrganizationUrl={(org) => `/org/${org.slug}/structures`}
        />
      </ClerkLoaded>
    </>
  )
}
