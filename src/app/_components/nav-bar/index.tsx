"use client"

import { useAuthActions } from "@convex-dev/auth/react"
import { useConvexAuth, useQuery } from "convex/react"
import Link from "next/link"
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
import { UserAvatar } from "~/components/UserAvatar"
import { useCurrentOrg } from "~/hooks/useCurrentOrg"
import OrgSwitcher from "./OrgSwitcher"
import StructureSwitcher from "./StructureSwitcher"

export default function NavBar() {
  const { isAuthenticated, isLoading } = useConvexAuth()
  const { org } = useCurrentOrg()
  const viewer = useQuery(api.users.viewer)
  const { signOut } = useAuthActions()

  return (
    <nav className="h-14 w-full border-b bg-card px-8 py-2">
      <div className="flex h-full items-center justify-between">
        <div className="flex h-full items-center gap-4">
          <Link href="/">
            <h1 className="text-xl font-bold text-primary">Struxts</h1>
          </Link>
          {isAuthenticated && (
            <>
              <div className="h-1/2 w-[1px] rotate-12 bg-muted-foreground" />
              <OrgSwitcher />
              {org && (
                <>
                  <div className="h-1/2 w-[1px] rotate-12 bg-muted-foreground" />
                  <StructureSwitcher />
                </>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {org ? (
                <>
                  <Link
                    href={`/org/${org.slug}/settings`}
                    className={buttonVariants({
                      variant: "ghost",
                      size: "sm",
                    })}
                  >
                    Settings
                  </Link>
                  <Link
                    href={`/org/${org.slug}/billing`}
                    className={buttonVariants({
                      variant: "ghost",
                      size: "sm",
                    })}
                  >
                    Billing
                  </Link>
                </>
              ) : (
                <Link
                  href="/pricing"
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                  })}
                >
                  Pricing
                </Link>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label="Account menu"
                >
                  <UserAvatar
                    src={viewer?.image}
                    name={viewer?.name ?? viewer?.email}
                    size={28}
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-0.5">
                      {viewer?.name && (
                        <span className="truncate text-sm font-medium">
                          {viewer.name}
                        </span>
                      )}
                      {viewer?.email && (
                        <span className="truncate text-xs text-muted-foreground">
                          {viewer.email}
                        </span>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account">Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => {
                      void signOut()
                    }}
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            !isLoading && (
              <Link
                href="/sign-in"
                className={buttonVariants({
                  variant: "default",
                  size: "sm",
                })}
              >
                Sign In
              </Link>
            )
          )}
        </div>
      </div>
    </nav>
  )
}
