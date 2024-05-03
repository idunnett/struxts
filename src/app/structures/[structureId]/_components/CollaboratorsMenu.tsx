import Image from "next/image"
import { Button } from "~/components/ui/button"
import { Skeleton } from "~/components/ui/skeleton"
import { api } from "~/trpc/react"

interface Props {
  structureId: number
  onAddCollaborator: () => void
}

export default function CollaboratorsMenu({
  structureId,
  onAddCollaborator,
}: Props) {
  const { data, isPending } =
    api.user.getStructureCollaborators.useQuery(structureId)

  return (
    <div className="flex w-max flex-col gap-4 p-4">
      {isPending && <Skeleton className="h-[20px] w-[100px] rounded-full" />}
      {data && (
        <>
          <div className="flex flex-col gap-2">
            {data.map((collaborator) => (
              <div
                key={collaborator.id}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <Image
                  src={collaborator.imageUrl}
                  alt={
                    collaborator.fullName ?? "Structure Collaborator Picture"
                  }
                  className="rounded-full"
                  width={24}
                  height={24}
                />
                <span className="text-sm">
                  {collaborator.fullName ??
                    ((
                      (collaborator.firstName ?? "") +
                      " " +
                      (collaborator.lastName ?? "")
                    ).trim() ||
                      collaborator.emailAddresses[0]?.emailAddress)}
                </span>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={onAddCollaborator}>
            + Add Collaborator
          </Button>
        </>
      )}
    </div>
  )
}
