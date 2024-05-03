import { type User } from "@clerk/nextjs/server"
import { Check, Plus } from "lucide-react"
import { toast } from "sonner"
import Spinner from "~/components/Spinner"
import { Button } from "~/components/ui/button"
import { api } from "~/trpc/react"
import { type StruxtUser } from "~/types"

interface Props {
  structureId: number
  user: User
  members: {
    clerkUser: User
    role: string
  }[]
  onAddMember: (user: StruxtUser) => void
}

export default function AddMember({
  structureId,
  user,
  members,
  onAddMember,
}: Props) {
  const trpcUtils = api.useUtils()
  const addMember = api.user.addToStructure.useMutation({
    onSuccess: (user) => onAddMember(user),
    onError: (error) => {
      toast.error(error.message)
    },
    onSettled: async () =>
      await trpcUtils.user.getStructureMembers.invalidate(),
  })

  return (
    <div className="flex w-full items-center justify-between rounded-md border px-2 py-1.5 text-sm">
      {user.emailAddresses[0]?.emailAddress}
      <Button
        size="sm"
        className="h-8 text-xs"
        onClick={() =>
          addMember.mutate({
            userId: user.id,
            structureId,
          })
        }
        disabled={
          addMember.isPending ||
          !!members?.find(({ clerkUser }) => clerkUser.id === user.id)
        }
      >
        {members?.find(({ clerkUser }) => clerkUser.id === user.id) ? (
          <div className="flex items-center gap-1">
            <Check className="h-3 w-3" /> Added
          </div>
        ) : (
          <div className="flex items-center gap-1">
            {addMember.isPending ? (
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
