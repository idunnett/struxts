"use client"

import { useMutation, useQuery } from "convex/react"
import { Check, ChevronsUpDown } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
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
import { OrgAvatar } from "~/components/OrgAvatar"
import { cn } from "~/lib/utils"
import { Skeleton } from "../../../components/ui/skeleton"
import { useCurrentOrg } from "../../../hooks/useCurrentOrg"

export default function OrgSwitcher() {
  const pathname = usePathname()
  const router = useRouter()
  const orgs = useQuery(api.organizations.listMine)
  const { org, isLoaded } = useCurrentOrg()
  const setActive = useMutation(api.organizations.setActive)

  if (!isLoaded || orgs === undefined)
    return <Skeleton className="h-8 w-44 rounded-md" />

  if (orgs.length === 0) return null

  function switchToOrg(orgId: string) {
    const selected = orgs?.find((o) => o._id === orgId)
    if (!selected) return
    void setActive({ orgId }).then(() => {
      if (pathname === "/pricing") return
      router.push(`/org/${selected.slug}/structures`)
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "h-8 max-w-52 gap-1.5 px-2 font-normal",
        )}
      >
        {org && (
          <OrgAvatar name={org.name} src={org.imageUrl} size={18} />
        )}
        <span className="truncate">{org?.name ?? "Select organization"}</span>
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Organizations
        </DropdownMenuLabel>
        {orgs.map((o) => {
          const isActive = o._id === org?._id
          return (
            <DropdownMenuItem
              key={o._id}
              className="gap-2"
              onSelect={() => {
                if (!isActive) switchToOrg(o._id)
              }}
            >
              <Check
                className={cn(
                  "h-4 w-4 shrink-0",
                  isActive ? "opacity-100" : "opacity-0",
                )}
              />
              <OrgAvatar name={o.name} src={o.imageUrl} size={18} />
              <span className="truncate">{o.name}</span>
            </DropdownMenuItem>
          )
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/org" className="text-muted-foreground">
            All organizations
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
