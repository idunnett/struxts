import { Settings } from "lucide-react"
import Image from "next/image"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { type StruxtUser } from "~/types"

interface Props {
  members: StruxtUser[]
  onAddMember: () => void
  onManageMembers: () => void
}

export default function MembersMenu({
  members,
  onAddMember,
  onManageMembers,
}: Props) {
  return (
    <div className="flex w-max flex-col gap-4 p-4 pt-1">
      {members && (
        <>
          <div className="flex flex-col gap-1">
            <div className="flex w-full justify-end">
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
            <div className="flex flex-col gap-2">
              {members.map((member) => (
                <div
                  key={member.clerkUser.id}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
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
                  <Badge variant="secondary" className="text-xs">
                    {member.role}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
          <Button size="sm" className="h-8 w-min text-xs" onClick={onAddMember}>
            + Add Member
          </Button>
        </>
      )}
    </div>
  )
}
