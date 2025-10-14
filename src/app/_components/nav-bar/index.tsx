"use client"

import { Authenticated, Unauthenticated } from "convex/react"
import Link from "next/link"
import { buttonVariants } from "~/components/ui/button"
import StructureSwitcher from "./StructureSwitcher"
import UserButton from "./UserButton"

export default function NavBar() {
  return (
    <nav className="h-14 w-full border-b bg-card px-8 py-2">
      <div className="flex h-full items-center justify-between">
        <div className="flex h-full items-center gap-4">
          <Link href="/">
            <h1 className="text-xl font-bold text-primary">Struxts</h1>
          </Link>
          <Authenticated>
            {/* <div className="h-1/2 w-[1px] rotate-12 bg-muted-foreground" /> */}
            <StructureSwitcher />
          </Authenticated>
        </div>
        <div className="flex items-center gap-4">
          <Authenticated>
            {/* <Link
              href={`/org/${org.organization.slug}/billing`}
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
              })}
            >
              Billing
            </Link> */}
            <UserButton />
          </Authenticated>
          <Unauthenticated>
            <Link
              href="/pricing"
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
              })}
            >
              Pricing
            </Link>
            <Link
              href="/sign-in"
              className={buttonVariants({
                variant: "default",
                size: "sm",
              })}
            >
              Sign In
            </Link>
          </Unauthenticated>
        </div>
      </div>
    </nav>
  )
}
