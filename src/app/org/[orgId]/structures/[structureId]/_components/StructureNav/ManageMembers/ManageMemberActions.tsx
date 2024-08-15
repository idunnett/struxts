import { useAuth } from "@clerk/nextjs"
import { toast } from "sonner"
import Spinner from "~/components/Spinner"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { api } from "~/trpc/react"
import { type StruxtUser } from "~/types"

interface Props {
  structureId: number
  member: StruxtUser
  isCurrentUserOwner: boolean
}

export default function ManageMemberActions({
  member,
  structureId,
  isCurrentUserOwner,
}: Props) {
  const session = useAuth()
  const trpcUtils = api.useUtils()
  const removeUser = api.user.removeFromStructure.useMutation({
    onError: (error) => toast.error(error.message),
    onSettled: async () =>
      await trpcUtils.user.getStructureMembers.invalidate(),
  })
  const updateUserRole = api.user.updateUserRole.useMutation({
    onError: (error) => toast.error(error.message),
    onSettled: async () =>
      await trpcUtils.user.getStructureMembers.invalidate(),
  })

  return (
    <div className="flex w-56 items-center gap-2">
      {member.role === "Owner" ? (
        <div className="grow">
          <Badge variant="secondary" className="text-xs">
            Owner
          </Badge>
        </div>
      ) : (
        <>
          {(isCurrentUserOwner || member.role === "Guest") &&
          member.clerkUser.id !== session.userId ? (
            <Select
              value={member.role}
              onValueChange={(value) => {
                updateUserRole.mutate({
                  structureId,
                  userId: member.clerkUser.id,
                  role: value as StruxtUser["role"],
                })
              }}
              disabled={updateUserRole.isPending}
            >
              <SelectTrigger className="relative h-8 w-[180px] grow text-xs">
                <SelectValue placeholder="Select a fruit" />
                {updateUserRole.isPending && (
                  <div className="absolute right-6 top-1/2 -translate-y-1/2">
                    <Spinner className="h-3 w-3" />
                  </div>
                )}
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="Guest" className="text-xs">
                    Guest
                  </SelectItem>
                  <SelectItem value="Admin" className="text-xs">
                    Admin
                  </SelectItem>
                  {isCurrentUserOwner && (
                    <SelectItem value="Owner" className="text-xs">
                      Owner
                    </SelectItem>
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
          ) : (
            <div className="grow">
              <Badge variant="secondary" className="text-xs">
                {member.role}
              </Badge>
            </div>
          )}
        </>
      )}
      {member.role !== "Owner" && member.clerkUser.id !== session.userId && (
        <Button
          variant="destructive"
          size="sm"
          className="h-8 text-xs"
          onClick={() => {
            removeUser.mutate({
              structureId,
              userId: member.clerkUser.id,
            })
          }}
        >
          {removeUser.isPending ? "Removing..." : "Remove"}
        </Button>
      )}
    </div>
  )
}
