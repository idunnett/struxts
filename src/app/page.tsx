import { SignedIn, SignedOut } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"
import Link from "next/link"
import { buttonVariants } from "~/components/ui/button"
import RotatingText from "./_components/RotatingText"

export default async function Home() {
  const session = auth()
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-16">
      <h1 className="flex flex-col gap-4 text-center text-4xl font-bold tracking-tight text-gray-800 sm:text-5xl">
        <span>Structure Diagrams for{""}</span>
        <RotatingText texts={["Businesses", "Org Charts", "Flow Charts"]} />
      </h1>
      <SignedOut>
        <Link href="/sign-in" className={buttonVariants()}>
          Get Started
        </Link>
      </SignedOut>
      <SignedIn>
        <Link
          href={`/org/${session.orgSlug ?? session.userId}/structures`}
          className={buttonVariants()}
        >
          My Dashboard
        </Link>
      </SignedIn>
    </div>
  )
}
