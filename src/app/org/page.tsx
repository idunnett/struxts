"use client"

import { OrganizationList } from "@clerk/nextjs"

export default function MyOrgsPage() {
  return (
    <div className="container mx-auto flex h-full w-full justify-center p-8">
      <div className="flex flex-col items-start justify-start gap-4">
        <h1 className="text-xl font-bold">My Organizations</h1>
        <OrganizationList
          hidePersonal
          afterSelectOrganizationUrl={(org) => `/org/${org.slug}/structures`}
          afterSelectPersonalUrl={(user) => `/org/${user.id}/structures`}
          afterCreateOrganizationUrl={(org) => `/org/${org.slug}/structures`}
        />
      </div>
    </div>
  )
}
