import { useMutation } from "convex/react"
import { Loader2, LucideUserPlus } from "lucide-react"
import { useRouter } from "next/navigation"
import { use, useState, useTransition } from "react"
import { toast } from "sonner"
import { z } from "zod"
import { api } from "../../../../../../../convex/_generated/api"
import { Button } from "../../../../../../components/ui/button"
import { Input } from "../../../../../../components/ui/input"
import { isCustomConvexError } from "../../../../../../lib/custom-convex-error"
import { StructureContext } from "../../StructureProvider"

interface Props {
  structureId: string
}

export default function InviteMemberForm({ structureId }: Props) {
  const { currentUserCanEdit } = use(StructureContext)
  const [email, setEmail] = useState("")

  const router = useRouter()
  const createInvite = useMutation(api.invites.createInvite)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!currentUserCanEdit) return
    startTransition(async () => {
      try {
        await createInvite({
          email,
          structureId,
          domain: window.location.origin,
        })
        setEmail("")
        router.refresh()
      } catch (error) {
        console.error(error)
        if (isCustomConvexError(error)) toast.error(error.data.message)
        else toast.error("Failed to invite user")
      }
    })
  }

  return (
    <form className="flex gap-3" onSubmit={handleSubmit}>
      <Input
        placeholder="Enter email address to invite"
        type="email"
        className="flex-1"
        value={email}
        disabled={!currentUserCanEdit}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button
        className="gap-2"
        disabled={
          !currentUserCanEdit ||
          isPending ||
          !z.string().email().safeParse(email).success
        }
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <LucideUserPlus className="size-4" />
        )}
        Invite User
      </Button>
    </form>
  )
}
