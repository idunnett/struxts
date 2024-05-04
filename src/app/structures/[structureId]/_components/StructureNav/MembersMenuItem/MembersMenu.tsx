import { Settings } from "lucide-react"
import Image from "next/image"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { isAdmin } from "~/lib/utils"
import { type StruxtUser } from "~/types"

interface Props {
  members: StruxtUser[]
  currentStructureUser: {
    role: string
    userId: string
  }
  onAddMember: () => void
  onManageMembers: () => void
}

export default function MembersMenu({
  members,
  currentStructureUser,
  onAddMember,
  onManageMembers,
}: Props) {
  return (
    <div className="flex w-max flex-col gap-4 p-4">
      {members && (
        <>
          <div className="flex flex-col gap-1">
            {isAdmin(currentStructureUser.role) && (
              <div className="-mt-3 flex w-full justify-end">
                <Button
                  variant="link"
                  size="sm"
                  className="w-min gap-1 px-0 text-xs"
                  onClick={onManageMembers}
                >
                  <Settings className="h-3 w-3" />
                  Manage
                </Button>
              </div>
            )}
            <div className="flex flex-col gap-2">
              {members.map((member) => (
                <div
                  key={member.clerkUser.id}
                  className="flex items-center gap-4 whitespace-nowrap"
                >
                  <div className="flex items-center gap-2">
                    <Image
                      src={member.clerkUser.imageUrl}
                      alt={
                        member.clerkUser.fullName ?? "Structure Member Picture"
                      }
                      className="rounded-full"
                      width={24}
                      height={24}
                    />
                    <span className="text-sm">
                      {member.clerkUser.fullName ??
                        ((
                          (member.clerkUser.firstName ?? "") +
                          " " +
                          (member.clerkUser.lastName ?? "")
                        ).trim() ||
                          member.clerkUser.emailAddresses[0]?.emailAddress)}
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {member.role}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
          {isAdmin(currentStructureUser.role) && (
            <Button
              size="sm"
              className="h-8 w-min text-xs"
              onClick={onAddMember}
            >
              + Add Member
            </Button>
          )}
        </>
      )}
    </div>
  )
}
