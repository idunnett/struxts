import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import Link from "next/link"
import { buttonVariants } from "~/components/ui/button"
import OrgSwitcher from "./OrgSwitcher"
import StructureSwitcher from "./StructureSwitcher"

export default async function NavBar() {
  return (
    <nav className="h-16 w-full border-b bg-card px-8 py-2">
      <div className="flex h-full items-center justify-between">
        <div className="flex h-full items-center gap-4">
          <Link href="/">
            <h1 className="text-xl font-bold text-primary">Struxts</h1>
          </Link>
          <SignedIn>
            <div className="h-1/2 w-[1px] rotate-12 bg-muted-foreground" />
            <OrgSwitcher />
            <StructureSwitcher />
          </SignedIn>
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
