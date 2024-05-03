import { formatDate } from "date-fns"
import StructureOwner from "./StructureOwner"
import { api } from "~/trpc/server"
import Image from "next/image"
import { cn } from "~/lib/utils"

export default async function StructureCardContent({
  structure,
}: {
  structure: {
    id: number
    name: string
    createdById: string
    owner: string
    createdAt: Date
  }
}) {
  const members = await api.user.getStructureMembers(structure.id)

  const membersWithoutOwner = members.filter(
    (c) => c.clerkUser.id !== structure.owner,
  )

  return (
    <>
      <StructureOwner owner={structure.owner} />
      {membersWithoutOwner.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Members: </span>
          <div className="flex items-center">
            {membersWithoutOwner.map((member, i) => (
              <Image
                key={member.clerkUser.id}
                src={member.clerkUser.imageUrl}
                alt={member.clerkUser.fullName ?? "Member picture"}
                width={24}
                height={24}
                className={cn("rounded-full", i !== 0 && "-ml-2")}
              />
            ))}
          </div>
        </div>
      )}
      <span className="text-sm text-muted-foreground">
        Created {formatDate(structure.createdAt, "MMM d, yyyy")}
      </span>
    </>
  )
}
