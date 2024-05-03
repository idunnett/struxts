import { formatDate } from "date-fns"
import StructureOwner from "./StructureOwner"
import { api } from "~/trpc/server"
import Image from "next/image"

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
  const collaborators = await api.user.getStructureCollaborators(structure.id)

  const collaboratorsWithoutOwner = collaborators.filter(
    (c) => c.id !== structure.owner,
  )

  return (
    <>
      <StructureOwner owner={structure.owner} />
      {collaboratorsWithoutOwner.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Collaborators: </span>
          <div>
            {collaboratorsWithoutOwner.map((collaborator) => (
              <Image
                key={collaborator.id}
                src={collaborator.imageUrl}
                alt={collaborator.fullName ?? "Structure Collaborator Picture"}
                className="rounded-full"
                width={24}
                height={24}
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
