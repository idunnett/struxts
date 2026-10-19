import { useMutation } from "convex/react"
import { Check, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import Spinner from "~/components/Spinner"
import { Button } from "~/components/ui/button"
import { UserAvatar } from "~/components/UserAvatar"
import { StructureMemberUser, OrgMemberUserData } from "~/types"
import { api } from "../../../../../../../../../convex/_generated/api"

interface Props {
  orgId: string
  structureId: string
  orgMember: OrgMemberUserData
  orgStructureMembers: StructureMemberUser[]
  onAddMember: () => void
}

export default function AddMember({
  orgId,
  structureId,
  orgMember,
  orgStructureMembers,
  onAddMember,
}: Props) {
  const [isAddingMember, startAddingMemberTransition] = useTransition()
  const addMember = useMutation(api.orgStructureUsers.create)
  const router = useRouter()

  return (
    <div className="flex w-full items-center justify-between gap-8 rounded-md border px-2 py-1.5 text-sm">
      <div className="flex items-center gap-2">
        <UserAvatar
          src={orgMember.imageUrl}
          name={orgMember.fullName ?? orgMember.primaryEmailAddress}
        />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm">
            {orgMember.fullName ??
              orgMember.primaryEmailAddress ??
              "Unknown user"}
          </span>
          {orgMember.fullName && orgMember.primaryEmailAddress && (
            <span className="truncate text-xs text-muted-foreground">
              {orgMember.primaryEmailAddress}
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
              orgId,
              structureId,
              userId: orgMember.userId,
            })
            router.refresh()
            onAddMember()
          })
        }
        disabled={
          isAddingMember ||
          !!orgStructureMembers.find(
            (member) => member.userId === orgMember.userId,
          )
        }
      >
        {orgStructureMembers.find(
          (member) => member.userId === orgMember.userId,
        ) ? (
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
