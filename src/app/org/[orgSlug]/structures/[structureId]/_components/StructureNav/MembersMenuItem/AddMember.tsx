import { useMutation } from "convex/react"
import { Check, Plus } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import Spinner from "~/components/Spinner"
import { Button } from "~/components/ui/button"
import { ClerkOrgStructureUser, ClerkUserData } from "~/types"
import { api } from "../../../../../../../../../convex/_generated/api"
import { cn } from "../../../../../../../../lib/utils"

interface Props {
  orgId: string
  structureId: string
  orgMember: ClerkUserData
  orgStructureMembers: ClerkOrgStructureUser[]
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
        <Image
          src={orgMember.imageUrl}
          alt={orgMember.fullName ?? "User Picture"}
          className="h-6 w-6 rounded-full"
          width={24}
          height={24}
        />
        <div className="flex flex-col">
          {orgMember.fullName && (
            <span className="text-sm">{orgMember.fullName}</span>
          )}
          {orgMember.primaryEmailAddress && (
            <span className={cn(orgMember.fullName ? "text-xs" : "text-sm")}>
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
            (clerkUser) => clerkUser.userId === orgMember.userId,
          )
        }
      >
        {orgStructureMembers.find(
          (clerkUser) => clerkUser.userId === orgMember.userId,
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
