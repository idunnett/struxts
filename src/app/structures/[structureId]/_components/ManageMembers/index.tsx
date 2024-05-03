import Image from "next/image"
import { api } from "~/trpc/react"
import ManageMemberActions from "./ManageMemberActions"
import { useMemo } from "react"
import { useAuth } from "@clerk/nextjs"

interface Props {
  structureId: number
}

export default function ManageMembers({ structureId }: Props) {
  const [members] = api.user.getStructureMembers.useSuspenseQuery(structureId)

  const { userId } = useAuth()
  const isCurrentUserOwner = useMemo(() => {
    return (
      members.find((member) => member.clerkUser.id === userId)?.role === "Owner"
    )
  }, [members, userId])

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-2">
        {members.map((member) => (
          <div key={member.clerkUser.id} className="flex justify-between gap-8">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <Image
                src={member.clerkUser.imageUrl}
                alt={member.clerkUser.fullName ?? "Structure Member Picture"}
                className="rounded-full"
                width={24}
                height={24}
              />
              <span className="text-sm">
                {member.clerkUser.fullName ??
                  ((
                    (member.clerkUser.firstName ?? "") +
                    " " +
                    (member.clerkUser.lastName ?? "")
                  ).trim() ||
                    member.clerkUser.emailAddresses[0]?.emailAddress)}
              </span>
            </div>
            <ManageMemberActions
              structureId={structureId}
              member={member}
              isCurrentUserOwner={isCurrentUserOwner}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
