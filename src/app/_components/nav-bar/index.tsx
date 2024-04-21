import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import { buttonVariants } from "~/components/ui/button"
import MyStructures from "./my-structures"
import Link from "next/link"
import { auth } from "@clerk/nextjs/server"

export default async function NavBar() {
  const session = auth()
  return (
    <nav className="h-16 w-full border-b px-8 py-2">
      <div className="flex h-full items-center justify-between">
        <div className="flex h-full items-center gap-8">
          <Link href={session.userId ? "/structures" : "/"}>
            <h1 className="text-xl font-bold">Struxts</h1>
          </Link>
          <SignedIn>
            <MyStructures />
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
