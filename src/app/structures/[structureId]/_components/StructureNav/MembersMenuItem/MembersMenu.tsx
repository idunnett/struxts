import { Doc } from "convex/_generated/dataModel"
import { cn, isOwner } from "~/lib/utils"
import UserAvatar from "../../../../../../components/UserAvatar"
import ManageMemberActions from "./ManageMemberActions"

interface Props {
  structureId: string
  structureMembers: (Doc<"orgStructureUsers"> & { user: Doc<"users"> })[]
  currentOrgStructureUser: Doc<"orgStructureUsers">
}

export default function MembersMenu({
  structureId,
  structureMembers,
  currentOrgStructureUser,
}: Props) {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex w-full flex-col gap-2">
        {structureMembers.map((member) => (
          <div
            key={member._id}
            className="flex w-full items-center justify-between gap-4 whitespace-nowrap rounded-sm border p-3"
          >
            <div className="flex items-center gap-2">
              <UserAvatar user={member.user} className="h-6 w-6 rounded-full" />
              <div className="flex flex-col">
                {member.user.name && (
                  <span className="text-sm">{member.user.name}</span>
                )}
                {member.user.email && (
                  <span
                    className={cn(member.user.name ? "text-xs" : "text-sm")}
                  >
                    {member.user.email}
                  </span>
                )}
              </div>
            </div>
            {/* <Badge variant="secondary" className="text-xs">
              {member.role}
            </Badge> */}
            <ManageMemberActions
              structureId={structureId}
              isCurrentUserOwner={isOwner(currentOrgStructureUser.role)}
              orgStructureUser={member}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
