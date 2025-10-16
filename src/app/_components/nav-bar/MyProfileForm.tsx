import { useMutation, useQuery } from "convex/react"
import { LucideCircleCheck, LucideRefreshCcw } from "lucide-react"
import { useEffect, useState, useTransition } from "react"
import { api } from "../../../../convex/_generated/api"
import Spinner from "../../../components/Spinner"
import UserAvatar from "../../../components/UserAvatar"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { useDebounce } from "../../../hooks/useDebounce"

export default function MyProfileForm() {
  const user = useQuery(api.auth.currentUser)
  const updateUser = useMutation(api.users.update)

  const [name, setName] = useState(user?.name || "")
  const debouncedName = useDebounce(name, 1000)

  const [isSaving, startTransition] = useTransition()

  useEffect(() => {
    if (debouncedName) {
      startTransition(async () => {
        await updateUser({ name: debouncedName })
      })
    }
  }, [debouncedName])

  if (user === undefined)
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    )
  if (user === null)
    return (
      <div className="flex h-full items-center justify-center">
        User not found
      </div>
    )

  return (
    <div className="flex flex-col gap-8 px-6 py-4">
      <div className="flex items-center gap-1 pt-1 text-xs text-muted-foreground">
        {!isSaving ? (
          <>
            <LucideCircleCheck className="h-3 w-3" />
            <span>Saved</span>
          </>
        ) : (
          <>
            <LucideRefreshCcw className="h-3 w-3" />
            <span>Saving...</span>
          </>
        )}
      </div>
      <div className="flex gap-10">
        <UserAvatar user={user} className="h-24 w-24 text-2xl" />
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              className="min-w-96 text-xl font-bold"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <span className="text-sm text-muted-foreground">{user.email}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
