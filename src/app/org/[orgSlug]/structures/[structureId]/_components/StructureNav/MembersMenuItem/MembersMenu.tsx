import Image from "next/image"
import { Doc } from "../../../../../../../../../convex/_generated/dataModel"
import { cn, isOwner } from "../../../../../../../../lib/utils"
import { ClerkOrgStructureUser } from "../../../../../../../../types"
import ManageMemberActions from "./ManageMemberActions"

interface Props {
  orgId: string
  structureId: string
  orgStructureMembers: ClerkOrgStructureUser[]
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
              <Image
                src={member.imageUrl}
                alt={member.fullName ?? "Structure Member Picture"}
                className="h-6 w-6 rounded-full"
                width={24}
                height={24}
              />
              <div className="flex flex-col">
                {member.fullName && (
                  <span className="text-sm">{member.fullName}</span>
                )}
                {member.primaryEmailAddress && (
                  <span className={cn(member.fullName ? "text-xs" : "text-sm")}>
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
