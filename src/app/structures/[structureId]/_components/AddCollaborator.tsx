import { type User } from "@clerk/nextjs/server"
import { Check, Plus } from "lucide-react"
import Spinner from "~/components/Spinner"
import { Button } from "~/components/ui/button"
import { api } from "~/trpc/react"

interface Props {
  structureId: number
  user: User
  collaborators: User[]
  onAddCollaborator: (user: User) => void
}

export default function AddCollaborator({
  structureId,
  user,
  collaborators,
  onAddCollaborator,
}: Props) {
  const addCollaborator = api.user.addToStructure.useMutation({
    onSuccess: (user) => onAddCollaborator(user),
  })

  return (
    <div className="flex w-full items-center justify-between rounded-md border px-2 py-1.5 text-sm">
      {user.emailAddresses[0]?.emailAddress}
      <Button
        size="sm"
        className="h-8 text-xs"
        onClick={() =>
          addCollaborator.mutate({
            userId: user.id,
            structureId,
          })
        }
        disabled={
          addCollaborator.isPending ||
          !!collaborators?.find((c) => c.id === user.id)
        }
      >
        {collaborators?.find((c) => c.id === user.id) ? (
          <div className="flex items-center gap-1">
            <Check className="h-3 w-3" /> Added
          </div>
        ) : (
          <div className="flex items-center gap-1">
            {addCollaborator.isPending ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <Plus className="h-3 w-3" />
            )}
            Add
          </div>
        )}
      </Button>
    </div>
  )
}
