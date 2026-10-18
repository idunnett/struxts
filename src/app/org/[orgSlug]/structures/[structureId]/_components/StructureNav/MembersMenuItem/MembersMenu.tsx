import { UserAvatar } from "~/components/UserAvatar"
import { Doc } from "../../../../../../../../../convex/_generated/dataModel"
import { isOwner } from "../../../../../../../../lib/utils"
import { StructureMemberUser } from "../../../../../../../../types"
import ManageMemberActions from "./ManageMemberActions"

interface Props {
  orgId: string
  structureId: string
  orgStructureMembers: StructureMemberUser[]
  currentOrgStructureUser: Doc<"orgStructureUsers">
}

export default function MembersMenu({
  orgId,
  structureId,
  orgStructureMembers,
  currentOrgStructureUser,
}: Props) {
  return (
    <div className="flex w-full flex-col gap-6 p-4">
      <div className="flex w-full flex-col gap-2">
        {orgStructureMembers.map((member) => (
          <div
            key={member._id}
            className="flex w-full items-center justify-between gap-4 whitespace-nowrap rounded-sm border p-3"
          >
            <div className="flex items-center gap-2">
              <UserAvatar
                src={member.imageUrl}
                name={member.fullName ?? member.primaryEmailAddress}
              />
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm">
                  {member.fullName ??
                    member.primaryEmailAddress ??
                    "Unknown member"}
                </span>
                {member.fullName && member.primaryEmailAddress && (
                  <span className="truncate text-xs text-muted-foreground">
                    {member.primaryEmailAddress}
                  </span>
                )}
              </div>
            </div>
            {/* <Badge variant="secondary" className="text-xs">
              {member.role}
            </Badge> */}
            <ManageMemberActions
              orgId={orgId}
              structureId={structureId}
              isCurrentUserOwner={isOwner(currentOrgStructureUser.role)}
              member={member}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
