"use client"

import { ClerkLoaded, ClerkLoading, OrganizationSwitcher } from "@clerk/nextjs"
import { usePathname } from "next/navigation"
import { Skeleton } from "../../../components/ui/skeleton"

export default function OrgSwitcher() {
  const pathname = usePathname()
  return (
    <>
      <ClerkLoading>
        <Skeleton className="h-7 w-52 rounded-md" />
      </ClerkLoading>
      <ClerkLoaded>
        <OrganizationSwitcher
          hidePersonal
          afterSelectOrganizationUrl={(org) => {
            if (pathname === "/pricing") return `/pricing`
            return `/org/${org.slug}/structures`
          }}
        />
      </ClerkLoaded>
    </>
  )
}
