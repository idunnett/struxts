"use client"

import { useAuth, useOrganization } from "@clerk/nextjs"
import { useQuery } from "convex/react"
import {
  LucideArrowRight,
  LucideChevronDown,
  LucidePlus,
  LucideWaypoints,
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useMemo, useState } from "react"
import { api } from "../../../../convex/_generated/api"
import { buttonVariants } from "../../../components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover"
import { Skeleton } from "../../../components/ui/skeleton"

export default function StructureSwitcher() {
  const params = useParams()
  const session = useAuth()
  const { organization, isLoaded } = useOrganization()
  const [popoverOpen, setPopoverOpen] = useState(false)

  const orgId = organization?.id

  const myStructures = useQuery(
    api.structures.getAllOfMyInOrgId,
    isLoaded && orgId ? { orgId } : "skip",
  )

  const selectedStructure = useMemo(() => {
    if (!params.structureId) return undefined
    if (typeof params.structureId !== "string") return undefined
    return myStructures?.find((s) => s._id === params.structureId)
  }, [params.structureId, myStructures])

  if (!isLoaded || !organization) return null

  return (
    <>
      <div className="h-1/2 w-px rotate-12 bg-muted-foreground" />
      {myStructures ? (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger className="flex h-7 max-w-96 items-center gap-2 rounded-sm border-none bg-transparent px-2 text-[13px] font-medium !text-muted-foreground !ring-0 hover:bg-[#00000008]">
            <LucideWaypoints className="h-4 w-4 text-primary" />
            {selectedStructure?.name ?? "Select a structure"}
            <LucideChevronDown className="h-4 w-4" />
          </PopoverTrigger>
          <PopoverContent side="bottom" align="start" className="p-0">
            {myStructures.map((structure) => (
              <Link
                key={structure._id}
                href={`/org/${session.orgSlug}/structures/${structure._id}`}
                className={buttonVariants({
                  variant: "ghost",
                  className:
                    "group flex w-full !justify-between gap-2 rounded-none border-b text-left text-[13px] text-muted-foreground transition-all duration-300 ease-in-out hover:text-primary",
                })}
                onClick={() => setPopoverOpen(false)}
              >
                <div className="flex items-center gap-2">
                  <LucideWaypoints className="h-4 w-4" />
                  {structure.name}
                </div>
                <LucideArrowRight className="h-3 w-3 -translate-x-2 text-muted-foreground opacity-0 transition-all duration-300 ease-in-out group-hover:translate-x-0 group-hover:text-primary group-hover:opacity-100" />
              </Link>
            ))}
            <Link
              href={`/org/${session.orgSlug}/structures/new`}
              className={buttonVariants({
                variant: "ghost",
                className:
                  "flex w-full !justify-start gap-2 text-left text-[13px] text-muted-foreground transition-colors duration-300 ease-in-out hover:text-primary",
              })}
              onClick={() => setPopoverOpen(false)}
            >
              <LucidePlus className="h-4 w-4" />
              New Structure
            </Link>
          </PopoverContent>
        </Popover>
      ) : (
        <Skeleton className="h-7 w-52 rounded-md" />
      )}
    </>
  )
}
