import {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuTrigger,
} from "~/components/ui/navigation-menu"
import MembersMenu from "./MembersMenu"
import { api } from "~/trpc/react"
import Image from "next/image"
import { Skeleton } from "~/components/ui/skeleton"
import { cn } from "~/lib/utils"

interface Props {
  structureId: number
  onAddMember: () => void
  onManageMembers: () => void
}

export default function MembersMenuItem({
  structureId,
  onAddMember,
  onManageMembers,
}: Props) {
  const { data: members, isPending } =
    api.user.getStructureMembers.useQuery(structureId)
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger className="flex gap-2">
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
      </NavigationMenuTrigger>
      <NavigationMenuContent>
        {isPending && <Skeleton className="h-[20px] w-[100px] rounded-full" />}
        {members && (
          <MembersMenu
            members={members}
            onAddMember={onAddMember}
            onManageMembers={onManageMembers}
          />
        )}
      </NavigationMenuContent>
    </NavigationMenuItem>
  )
}
