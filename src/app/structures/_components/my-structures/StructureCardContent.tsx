"use client"

import { useQuery } from "convex/react"
import { formatDate } from "date-fns"
import { LucideArrowRight } from "lucide-react"
import { api } from "../../../../../convex/_generated/api"
import { Doc } from "../../../../../convex/_generated/dataModel"
import { Skeleton } from "../../../../components/ui/skeleton"
import UserAvatar from "../../../../components/UserAvatar"
import { cn } from "../../../../lib/utils"

interface Props {
  structure: Doc<"structures">
}

export default function StructureCardContent({ structure }: Props) {
  const structureMembers = useQuery(api.structures.getMembers, {
    structureId: structure._id,
  })

  const owner = structureMembers?.find((c) => c._id === structure.ownerId)
  const membersWithoutOwner = structureMembers?.filter(
    (c) => c._id !== structure.ownerId,
  )

  return (
    <div className="flex items-end justify-between">
      <div className="flex flex-col items-start gap-2">
        <div className="flex min-h-8 items-center gap-2">
          {owner ? (
            <>
              <span className="text-sm text-muted-foreground">Owner: </span>
              <UserAvatar user={owner} />
            </>
          ) : (
            <Skeleton className="h-4 w-36" />
          )}
        </div>
        {!!membersWithoutOwner?.length && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Members: </span>
            <div className="flex items-center">
              {membersWithoutOwner.map((member, i) => (
                <UserAvatar
                  key={member._id}
                  user={member}
                  className={cn(i !== 0 && "-ml-2")}
                />
              ))}
            </div>
          </div>
        )}
        <span className="text-sm text-muted-foreground">
          Created {formatDate(structure._creationTime, "MMM d, yyyy")}
        </span>
      </div>
      <LucideArrowRight className="h-5 w-5 -translate-x-2 text-muted-foreground opacity-0 transition-all duration-300 ease-in-out group-hover:translate-x-0 group-hover:text-primary group-hover:opacity-100" />
    </div>
  )
}
