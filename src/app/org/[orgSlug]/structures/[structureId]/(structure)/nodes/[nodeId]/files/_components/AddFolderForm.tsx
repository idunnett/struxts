import { useAuth } from "@clerk/nextjs"
import { useMutation } from "convex/react"
import { FormEvent, useState, useTransition } from "react"
import { toast } from "sonner"
import { api } from "../../../../../../../../../../../convex/_generated/api"
import { Button } from "../../../../../../../../../../components/ui/button"
import { Input } from "../../../../../../../../../../components/ui/input"

interface Props {
  nodeId: string
  structureId: string
  onAddFolder: () => void
}

export default function AddFolderForm({
  nodeId,
  structureId,
  onAddFolder,
}: Props) {
  const session = useAuth()
  const [folderName, setFolderName] = useState("")
  const createFolder = useMutation(api.folders.create)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      if (!session.orgId) return
      await createFolder({
        name: folderName,
        nodeId,
        structureId,
        orgId: session.orgId,
      })
      toast.success("Folder created successfully")
      onAddFolder()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Input
        placeholder="Folder name"
        className="h-9"
        value={folderName}
        onChange={(e) => setFolderName(e.target.value)}
      />
      <Button size="sm" disabled={isPending}>
        {isPending ? "Creating..." : "Create"}
      </Button>
    </form>
  )
}
