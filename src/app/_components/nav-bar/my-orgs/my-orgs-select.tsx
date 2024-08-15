"use client"

import { Preloaded, usePreloadedQuery } from "convex/react"
import { useParams, useRouter } from "next/navigation"
import { useMemo } from "react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "~/components/ui/select"
import { api } from "../../../../../convex/_generated/api"

interface Props {
  myPreloadedOrgs: Preloaded<typeof api.orgs.getAllOfMy>
}

export default function MyOrgsSelect({ myPreloadedOrgs }: Props) {
  const myOrgs = usePreloadedQuery(myPreloadedOrgs)

  const params = useParams()
  const router = useRouter()

  const selectedOrgId = useMemo(() => {
    if (!params.orgId) return undefined
    if (typeof params.orgId !== "string") return undefined
    return params.orgId
  }, [params.orgId])

  const selectedOrg = useMemo(() => {
    return myOrgs?.find((org) => org?._id === selectedOrgId)
  }, [myOrgs, selectedOrgId])

  function handleOrgChange(value?: string) {
    if (!value) return
    router.push(`/org/${value}/structures`)
  }

  if (!myOrgs) return null

  return (
    <>
      <div className="h-1/2 w-[1px] rotate-12 bg-muted-foreground" />
      <Select
        key={selectedOrgId}
        value={selectedOrgId}
        onValueChange={handleOrgChange}
      >
        <SelectTrigger className="max-w-96 gap-2 border-none font-medium !ring-0">
          {selectedOrg ? (
            <span className="truncate whitespace-nowrap">
              {selectedOrg.name}
            </span>
          ) : (
            <span className="truncate whitespace-nowrap">
              Select an Organization
            </span>
          )}
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>My Organizations</SelectLabel>
            {myOrgs?.map(
              (org) =>
                org && (
                  <SelectItem key={org?._id} value={org._id.toString()}>
                    {org.name}
                  </SelectItem>
                ),
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
    </>
  )
}
