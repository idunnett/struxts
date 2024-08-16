"use client"

import { OrganizationMembershipPublicUserData } from "@clerk/nextjs/server"
import { useQuery } from "convex/react"
import { formatDate } from "date-fns"
import Image from "next/image"
import { api } from "../../../../../../../convex/_generated/api"
import { Doc } from "../../../../../../../convex/_generated/dataModel"
import { Skeleton } from "../../../../../../components/ui/skeleton"
import { cn } from "../../../../../../lib/utils"

interface Props {
  structure: Doc<"structures">
  orgMembers: OrganizationMembershipPublicUserData[]
}

export default function StructureCardContent({ structure, orgMembers }: Props) {
  const structureMembers = useQuery(api.structures.getMembers, {
    structureId: structure._id,
  })

  const membersWithoutOwners = structureMembers?.filter(
    (c) => c.role !== "Owner",
  )
  const owners = structureMembers?.filter((c) => c.role === "Owner")

  return (
    <>
      <div className="flex min-h-8 items-center gap-2">
        {owners ? (
          <>
            <span className="text-sm text-muted-foreground">
              Owner{owners.length > 1 ? "s" : ""}:{" "}
            </span>
            <div className="flex items-center">
              {owners.map((member, i) => {
                const clerkMember = orgMembers.find(
                  (m) => m.userId === member.userId,
                )
                if (!clerkMember) return null
                return (
                  <Image
                    key={clerkMember.userId}
                    src={clerkMember.imageUrl}
                    alt={clerkMember.identifier ?? "Owner picture"}
                    width={24}
                    height={24}
                    className={cn("h-6 w-6 rounded-full", i !== 0 && "-ml-2")}
                  />
                )
              })}
            </div>
          </>
        ) : (
          <Skeleton className="h-4 w-36" />
        )}
      </div>
      {!!membersWithoutOwners?.length && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Members: </span>
          <div className="flex items-center">
            {membersWithoutOwners.map((member, i) => {
              const clerkMember = orgMembers.find(
                (m) => m.userId === member.userId,
              )
              if (!clerkMember) return null
              return (
                <Image
                  key={clerkMember.userId}
                  src={clerkMember.imageUrl}
                  alt={clerkMember.identifier ?? "Member picture"}
                  width={24}
                  height={24}
                  className={cn("h-6 w-6 rounded-full", i !== 0 && "-ml-2")}
                />
              )
            })}
          </div>
        </div>
      )}
      <span className="text-sm text-muted-foreground">
        Created {formatDate(structure._creationTime, "MMM d, yyyy")}
      </span>
    </>
  )
}
