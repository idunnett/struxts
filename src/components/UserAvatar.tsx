import { Doc } from "../../convex/_generated/dataModel"
import { cn, getInitials } from "../lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

interface Props {
  user: Doc<"users">
  className?: string
}

export default function UserAvatar({ user, className }: Props) {
  return (
    <Avatar className={cn("h-6 w-6 rounded-full", className)}>
      <AvatarImage src={user.image} />
      <AvatarFallback>{getInitials(user)}</AvatarFallback>
    </Avatar>
  )
}
