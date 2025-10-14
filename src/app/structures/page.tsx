import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server"
import { fetchQuery } from "convex/nextjs"
import Link from "next/link"
import { buttonVariants } from "~/components/ui/button"
import { api } from "../../../convex/_generated/api"
import { Doc } from "../../../convex/_generated/dataModel"
import ErrorDisplay from "../../components/ErrorDisplay"
import MyStructures from "./_components/my-structures"

export default async function StructuresPage() {
  const token = await convexAuthNextjsToken()
  let myStructures: Doc<"structures">[]
  try {
    myStructures = await fetchQuery(api.structures.getAllOfMy, {}, { token })
  } catch (error) {
    console.log(error)
    return <ErrorDisplay error={JSON.stringify(error)} />
  }

  return (
    <div className="container mx-auto flex flex-col gap-4 px-4 py-8">
      <div className="flex justify-between px-2">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-bold">Structures</h1>
        </div>
        <Link
          href={`/structures/new`}
          className={buttonVariants({
            className: "flex items-center gap-2",
          })}
        >
          <span className="-mt-1 text-2xl font-semibold">+</span>
          <span className="hidden sm:inline">Create a new structure</span>
        </Link>
      </div>
      <MyStructures myPrefetchedStructures={myStructures} />
    </div>
  )
}
