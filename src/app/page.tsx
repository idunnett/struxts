import Link from "next/link"
import RotatingText from "./_components/RotatingText"
import { buttonVariants } from "~/components/ui/button"

export default async function Home() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-16">
      <h1 className="flex flex-col gap-4 text-center text-4xl font-bold tracking-tight text-gray-800 sm:text-5xl">
        <span>Structure Diagrams for{""}</span>
        <RotatingText texts={["Businesses", "Org Charts", "Flow Charts"]} />
      </h1>
      <Link href="/structures" className={buttonVariants()}>
        Get Started
      </Link>
    </div>
  )
}
