"use client"

import { LucideWaypoints } from "lucide-react"
import Link from "next/link"
import { api } from "../../../../../convex/_generated/api"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card"
import { usePrefetchedAuthQuery } from "../../../../hooks/usePrefetchedQuery"
import StructureCardContent from "./StructureCardContent"

interface Props {
  myPrefetchedStructures: typeof api.structures.getAllOfMy._returnType
}

export default function MyStructures({ myPrefetchedStructures }: Props) {
  const myStructures = usePrefetchedAuthQuery(
    api.structures.getAllOfMy,
    myPrefetchedStructures,
  )

  if (myStructures.length === 0) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center gap-2">
        <LucideWaypoints className="mx-auto h-6 w-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          You are not currently associated with any structures.
        </p>
        <p className="text-sm text-muted-foreground">
          Try creating a new structure or ask to be invited to an existing one.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap">
      {myStructures.map(
        (structure) =>
          structure && (
            <div key={structure._id} className="w-full p-3 sm:w-1/2 lg:w-1/3">
              <Link
                href={`/structures/${structure._id}`}
                className="w-full"
                prefetch={false}
              >
                <Card className="group w-full border border-transparent transition-all ease-in-out hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl text-primary">
                      <LucideWaypoints className="h-5 w-5" />
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
  )
}
