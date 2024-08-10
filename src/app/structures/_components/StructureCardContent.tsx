import { formatDate } from "date-fns"
import Image from "next/image"
import { cn } from "~/lib/utils"
import { api } from "~/trpc/server"

export default async function StructureCardContent({
  structure,
}: {
  structure: {
    id: number
    name: string
    createdById: string
    createdAt: Date
  }
}) {
  const members = await api.user.getStructureMembers(structure.id)

  const membersWithoutOwners = members.filter((c) => c.role !== "Owner")
  const owners = members.filter((c) => c.role === "Owner")

  return (
    <>
      {owners.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Owner{owners.length > 1 ? "s" : ""}:{" "}
          </span>
          <div className="flex items-center">
            {owners.map((member, i) => (
              <Image
                key={member.clerkUser.id}
                src={member.clerkUser.imageUrl}
                alt={member.clerkUser.fullName ?? "Owner picture"}
                width={24}
                height={24}
                className={cn("rounded-full", i !== 0 && "-ml-2")}
              />
            ))}
          </div>
        </div>
      )}
      {membersWithoutOwners.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Members: </span>
          <div className="flex items-center">
            {membersWithoutOwners.map((member, i) => (
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
