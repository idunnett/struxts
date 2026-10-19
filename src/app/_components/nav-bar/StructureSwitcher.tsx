"use client"

import { useQuery } from "convex/react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { api } from "../../../../convex/_generated/api"
import { buttonVariants } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { useCurrentOrg } from "~/hooks/useCurrentOrg"
import { cn } from "~/lib/utils"
import { Skeleton } from "../../../components/ui/skeleton"

export default function StructureSwitcher() {
  const { org, orgSlug, role, isLoaded } = useCurrentOrg()
  const params = useParams() as { structureId?: string }
  const structures = useQuery(
    api.structures.getAllOfMyInOrgId,
    org?._id ? { orgId: org._id } : "skip",
  )

  if (!isLoaded || !org || !orgSlug) return null
  if (structures === undefined)
    return <Skeleton className="h-8 w-44 rounded-md" />

  const canCreate = role === "owner" || role === "admin"
  const activeStructure =
    structures.find((s) => s && s._id === params.structureId) ?? null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "h-8 max-w-52 gap-1.5 px-2 font-normal",
        )}
      >
        <span className="truncate">
          {activeStructure?.name ?? "Select structure"}
        </span>
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Structures
        </DropdownMenuLabel>
        {structures.length === 0 ? (
          <DropdownMenuItem disabled className="text-muted-foreground">
            No structures yet
          </DropdownMenuItem>
        ) : (
          structures.map(
            (structure) =>
              structure && (
                <DropdownMenuItem key={structure._id} asChild>
                  <Link
                    href={`/org/${orgSlug}/structures/${structure._id}`}
                    className="gap-2"
                  >
                    <Check
                      className={cn(
                        "h-4 w-4 shrink-0",
                        structure._id === activeStructure?._id
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    <span className="truncate">{structure.name}</span>
                  </Link>
                </DropdownMenuItem>
              ),
          )
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href={`/org/${orgSlug}/structures`}
            className="text-muted-foreground"
          >
            All structures
          </Link>
        </DropdownMenuItem>
        {canCreate && (
          <DropdownMenuItem asChild>
            <Link
              href={`/org/${orgSlug}/structures/new`}
              className="gap-2"
            >
              <Plus className="h-4 w-4 shrink-0" />
              New structure
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
