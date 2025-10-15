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
import { Separator } from "../../../../../../components/ui/separator"
import UserAvatar from "../../../../../../components/UserAvatar"
import InviteMemberForm from "./InviteMemberForm"
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
          <DialogDescription>
            Manage members of this structure and invite new users to join
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 px-6 py-2">
          <InviteMemberForm structureId={structureId} />
          <Separator />
          <MembersMenu
            structureId={structureId}
            structureMembers={structureMembers}
            currentOrgStructureUser={currentOrgStructureUser}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
