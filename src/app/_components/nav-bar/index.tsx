"use client"

import { SignedIn, SignedOut, useOrganization, UserButton } from "@clerk/nextjs"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { buttonVariants } from "~/components/ui/button"
import OrgSwitcher from "./OrgSwitcher"
import StructureSwitcher from "./StructureSwitcher"

export default function NavBar() {
  const pathname = usePathname()
  const org = useOrganization()

  return (
    <nav className="h-14 w-full border-b bg-card px-8 py-2">
      <div className="flex h-full items-center justify-between">
        <div className="flex h-full items-center gap-4">
          <Link href="/">
            <h1 className="text-xl font-bold text-primary">Struxts</h1>
          </Link>
          {pathname.startsWith("/org") ? (
            <SignedIn>
              <div className="h-1/2 w-[1px] rotate-12 bg-muted-foreground" />
              <OrgSwitcher />
              {org.organization && <StructureSwitcher />}
            </SignedIn>
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
        </div>
        <div>
          <SignedIn>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <Link
              href="/sign-in"
              className={buttonVariants({
                variant: "default",
                size: "sm",
              })}
            >
              Sign In
            </Link>
          </SignedOut>
        </div>
      </div>
    </nav>
  )
}
