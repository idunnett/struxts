import { fetchQuery } from "convex/nextjs"
import Link from "next/link"
import { buttonVariants } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { api } from "../../../../../convex/_generated/api"
import { Doc } from "../../../../../convex/_generated/dataModel"
import ErrorDisplay from "../../../../components/ErrorDisplay"
import { isCustomConvexError } from "../../../../lib/utils"
import { getAuthToken } from "../../../auth"
import StructureCardContent from "./_components/StructureCardContent"

interface Props {
  params: {
    orgId: string
  }
}

export default async function StructuresPage({ params: { orgId } }: Props) {
  const token = await getAuthToken()
  let myStructures: (Doc<"structures"> | null)[]
  try {
    myStructures = await fetchQuery(
      api.structures.getAllOfMyInOrgId,
      {
        orgId,
      },
      { token },
    )
  } catch (error) {
    if (isCustomConvexError(error))
      return (
        <ErrorDisplay
          statusCode={error.data.statusCode}
          message={error.data.message}
        />
      )
    return (
      <ErrorDisplay
        statusCode={500}
        message="An error occurred while fetching the structures"
      />
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex justify-between px-2">
        <h2 className="text-2xl font-medium">Your Structures</h2>
        <Link
          href="/structures/new"
          className={buttonVariants({
            className: "flex items-center gap-2",
          })}
        >
          <span className="-mt-1 text-2xl font-semibold">+</span>
          <span className="hidden sm:inline">Create a new structure</span>
        </Link>
      </div>
      <div className="flex flex-wrap">
        {myStructures.map(
          (structure) =>
            structure && (
              <div key={structure._id} className="w-full p-3 sm:w-1/2 lg:w-1/3">
                <Link href={`/structures/${structure._id}`} className="w-full">
                  <Card className="w-full transition-all ease-in-out hover:shadow-md">
                    <CardHeader>
                      <CardTitle className="text-base">
                        {structure.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-1">
                      <StructureCardContent structure={structure} />
                    </CardContent>
                  </Card>
                </Link>
              </div>
            ),
        )}
      </div>
    </div>
  )
}
