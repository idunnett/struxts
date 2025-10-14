import { Doc } from "convex/_generated/dataModel"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { cn } from "~/lib/utils"
import UserAvatar from "../../../../../../components/UserAvatar"
import InviteMemberForm from "../InviteMemberForm"
import MembersMenu from "./MembersMenu"

interface Props {
  structureId: string
  currentOrgStructureUser: Doc<"orgStructureUsers">
  structureMembers: (Doc<"orgStructureUsers"> & { user: Doc<"users"> })[]
}

export default function MembersMenuItem({
  structureId,
  currentOrgStructureUser,
  structureMembers,
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
            {structureMembers.slice(0, 3).map((member, i) => (
              <UserAvatar
                key={member._id}
                user={member.user}
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
          structureId={structureId}
          structureMembers={structureMembers}
        />
        <MembersMenu
          structureId={structureId}
          structureMembers={structureMembers}
          currentOrgStructureUser={currentOrgStructureUser}
        />
      </DialogContent>
    </Dialog>
  )
}
