import { useAuthActions } from "@convex-dev/auth/react"
import { useQuery } from "convex/react"
import { LogOut, Settings, User } from "lucide-react"
import { Avatar, AvatarFallback } from "~/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { getInitials } from "~/lib/utils"
import { api } from "../../../../convex/_generated/api"

interface Props {
  onProfileClick?: () => void
  onSettingsClick?: () => void
}

export default function UserButton({ onProfileClick, onSettingsClick }: Props) {
  const { signOut } = useAuthActions()
  const user = useQuery(api.auth.currentUser)

  const initials = getInitials(user)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full focus:outline-none focus:ring-[2px] focus:ring-primary focus:ring-offset-2">
        <Avatar>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex items-center gap-2"
          onClick={onProfileClick}
        >
          <User className="h-4 w-4" /> Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-2"
          onClick={onSettingsClick}
        >
          <Settings className="h-4 w-4" /> Settings
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-2 text-destructive"
          onClick={() => signOut()}
        >
          <LogOut className="h-4 w-4" /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
