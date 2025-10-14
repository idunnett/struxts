import { useMutation } from "convex/react"
import { Check, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import Spinner from "~/components/Spinner"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"
import { api } from "../../../../../../../convex/_generated/api"
import { Doc } from "../../../../../../../convex/_generated/dataModel"
import UserAvatar from "../../../../../../components/UserAvatar"

interface Props {
  structureId: string
  user: Doc<"users">
  structureMembers: (Doc<"orgStructureUsers"> & { user: Doc<"users"> })[]
  onAddMember: () => void
}

export default function AddMember({
  structureId,
  user,
  structureMembers,
  onAddMember,
}: Props) {
  const [isAddingMember, startAddingMemberTransition] = useTransition()
  const addMember = useMutation(api.orgStructureUsers.create)
  const router = useRouter()

  return (
    <div className="flex w-full items-center justify-between gap-8 rounded-md border px-2 py-1.5 text-sm">
      <div className="flex items-center gap-2">
        <UserAvatar user={user} className="h-6 w-6 rounded-full" />
        <div className="flex flex-col">
          {user.name && <span className="text-sm">{user.name}</span>}
          {user.email && (
            <span className={cn(user.name ? "text-xs" : "text-sm")}>
              {user.email}
            </span>
          )}
        </div>
      </div>
      <Button
        size="sm"
        className="h-8 text-xs"
        onClick={() =>
          startAddingMemberTransition(async () => {
            await addMember({
              structureId,
              userId: user._id,
            })
            router.refresh()
            onAddMember()
          })
        }
        disabled={
          isAddingMember ||
          !!structureMembers.find((member) => member.userId === user._id)
        }
      >
        {structureMembers.find((member) => member.userId === user._id) ? (
          <div className="flex items-center gap-1">
            <Check className="h-3 w-3" /> Added
          </div>
        ) : (
          <div className="flex items-center gap-1">
            {isAddingMember ? (
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
