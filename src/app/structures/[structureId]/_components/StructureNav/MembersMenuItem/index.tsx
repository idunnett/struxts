import MembersMenu from "./MembersMenu"
import { api } from "~/trpc/react"
import Image from "next/image"
import { Skeleton } from "~/components/ui/skeleton"
import { cn } from "~/lib/utils"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "~/components/ui/popover"
import { Button } from "~/components/ui/button"

interface Props {
  structureId: number
  currentStructureUser: {
    role: string
    userId: string
  }
  onAddMember: () => void
  onManageMembers: () => void
}

export default function MembersMenuItem({
  structureId,
  currentStructureUser,
  onAddMember,
  onManageMembers,
}: Props) {
  const { data: members, isPending } =
    api.user.getStructureMembers.useQuery(structureId)
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <div className="flex items-center">
            {isPending && (
              <>
                <Skeleton className="h-6 w-6 rounded-full border" />
                <Skeleton className="-ml-2 h-6 w-6 rounded-full border" />
                <Skeleton className="-ml-2 h-6 w-6 rounded-full border" />
              </>
            )}
            {members
              ?.slice(0, 3)
              ?.map((member, i) => (
                <Image
                  key={member.clerkUser.id}
                  src={member.clerkUser.imageUrl}
                  alt={member.clerkUser.fullName ?? "Member picture"}
                  width={24}
                  height={24}
                  className={cn("rounded-full", i !== 0 && "-ml-2")}
                />
              ))}
          </div>
          Members
        </Button>
      </PopoverTrigger>
      <PopoverContent sideOffset={10}>
        {isPending && <Skeleton className="h-[20px] w-[100px] rounded-full" />}
        {members && (
          <MembersMenu
            members={members}
            currentStructureUser={currentStructureUser}
            onAddMember={onAddMember}
            onManageMembers={onManageMembers}
          />
        )}
      </PopoverContent>
    </Popover>
  )
}
