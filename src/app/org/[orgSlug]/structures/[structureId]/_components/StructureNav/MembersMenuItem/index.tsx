import Image from "next/image"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"
import { Doc } from "../../../../../../../../../convex/_generated/dataModel"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../../../../../components/ui/dialog"
import { ClerkOrgStructureUser } from "../../../../../../../../types"
import InviteMemberForm from "../InviteMemberForm"
import MembersMenu from "./MembersMenu"

interface Props {
  orgId: string
  structureId: string
  currentOrgStructureUser: Doc<"orgStructureUsers">
  orgStructureMembers: ClerkOrgStructureUser[]
}

export default function MembersMenuItem({
  orgId,
  structureId,
  currentOrgStructureUser,
  orgStructureMembers,
}: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex h-8 items-center gap-2"
        >
          <div className="flex items-center">
            {orgStructureMembers.slice(0, 3).map((member, i) => (
              <Image
                key={member._id}
                src={member.imageUrl}
                alt={member.fullName ?? "Member picture"}
                width={24}
                height={24}
                className={cn("h-6 w-6 rounded-full", i !== 0 && "-ml-2")}
              />
            ))}
          </div>
          Members
        </Button>
      </DialogTrigger>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Structure Members</DialogTitle>
          <DialogDescription hidden>
            Manage members of this structure
          </DialogDescription>
        </DialogHeader>
        <InviteMemberForm
          orgId={orgId}
          structureId={structureId}
          orgStructureMembers={orgStructureMembers}
        />
        <MembersMenu
          orgId={orgId}
          structureId={structureId}
          orgStructureMembers={orgStructureMembers}
          currentOrgStructureUser={currentOrgStructureUser}
        />
      </DialogContent>
    </Dialog>
  )
}
