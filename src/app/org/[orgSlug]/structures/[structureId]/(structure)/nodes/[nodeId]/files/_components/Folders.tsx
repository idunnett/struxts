import { useAuth } from "@clerk/nextjs"
import { useQuery } from "convex/react"
import { LucideFolderPlus } from "lucide-react"
import { use, useState } from "react"
import { api } from "../../../../../../../../../../../convex/_generated/api"
import Spinner from "../../../../../../../../../../components/Spinner"
import { Button } from "../../../../../../../../../../components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../../../../../../../../components/ui/popover"
import { StructureContext } from "../../../../../_components/StructureProvider"
import AddFolderForm from "./AddFolderForm"
import FolderFiles from "./FolderFiles"

interface Props {
  nodeId: string
  structureId: string
}

export default function Folders({ nodeId, structureId }: Props) {
  const session = useAuth()
  const folders = useQuery(api.folders.getByNode, {
    nodeId,
    structureId,
    orgId: session.orgId ?? null,
  })
  const files = useQuery(api.files.getByNode, {
    nodeId,
    structureId,
    orgId: session.orgId ?? null,
  })
  const { editable } = use(StructureContext)
  const [addFolderPopoverOpen, setAddFolderPopoverOpen] = useState(false)
  // function humanFileSize(size: number) {
  //   var i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024))
  //   return (
  //     +(size / Math.pow(1024, i)).toFixed(2) * 1 +
  //     " " +
  //     ["B", "KB", "MB", "GB", "TB"][i]
  //   )
  // }

  if (!files || !folders)
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    )

  return (
    <div className="-mx-4 flex h-full flex-col gap-2 overflow-auto px-4">
      {editable && (
        <Popover
          open={addFolderPopoverOpen}
          onOpenChange={setAddFolderPopoverOpen}
        >
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-min gap-2" size="sm">
              <LucideFolderPlus className="h-4 w-4" />
              Add Folder
            </Button>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="start">
            <AddFolderForm
              nodeId={nodeId}
              structureId={structureId}
              onAddFolder={() => setAddFolderPopoverOpen(false)}
            />
          </PopoverContent>
        </Popover>
      )}
      <div className="flex flex-col">
        {folders.map((folder) => (
          <FolderFiles
            key={folder._id}
            files={files.filter((file) => file.folderId === folder._id)}
            folder={folder}
            nodeId={nodeId}
            structureId={structureId}
          />
        ))}
      </div>
    </div>
  )
}
