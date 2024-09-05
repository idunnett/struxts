import { useAuth } from "@clerk/nextjs"
import { UploadFileResponse, useUploadFiles } from "@xixixao/uploadstuff/react"
import { useMutation } from "convex/react"
import { formatDate } from "date-fns"
import {
  LucideChevronDown,
  LucideDownload,
  LucideFolder,
  LucideTrash,
  LucideUpload,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { use, useState, useTransition } from "react"
import {
  FaFile,
  FaFileCsv,
  FaFileExcel,
  FaFileImage,
  FaFilePdf,
  FaFileWord,
} from "react-icons/fa6"
import { toast } from "sonner"
import { api } from "../../../../../../../../../../../convex/_generated/api"
import { Doc } from "../../../../../../../../../../../convex/_generated/dataModel"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../../../../../../../../../components/ui/alert-dialog"
import {
  Button,
  buttonVariants,
} from "../../../../../../../../../../components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../../../../../../../../components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../../../../../../../components/ui/dialog"
import { Progress } from "../../../../../../../../../../components/ui/progress"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../../../../../../../../components/ui/tooltip"
import { cn, downloadFile } from "../../../../../../../../../../lib/utils"
import { StructureContext } from "../../../../../_components/StructureProvider"
import StorageImage from "./StorageImage"

interface Props {
  structureId: string
  orgId: string
  nodeId: string
  folder: Doc<"folders">
  files: Doc<"files">[]
}

export default function FolderFiles({
  nodeId,
  orgId,
  structureId,
  files,
  folder,
}: Props) {
  const session = useAuth()
  const generateUploadUrl = useMutation(api.files.generateUploadUrl)
  const saveFiles = useMutation(api.files.saveFiles)
  const deleteFile = useMutation(api.files.deleteFile)
  const deleteFolder = useMutation(api.folders.deleteFolder)
  const router = useRouter()
  const { editable } = use(StructureContext)
  const [collapsibleOpen, setCollapsibleOpen] = useState(false)
  const [isDeletingFolder, startDeleteFolderTransition] = useTransition()

  async function saveAfterUpload(files: UploadFileResponse[]) {
    await saveFiles({
      files: files.map(({ response, name, type, size }) => ({
        storageId: (response as { storageId: string }).storageId,
        nodeId,
        orgId,
        structureId,
        name,
        size,
        type,
        folderId: folder._id,
      })),
    })
  }
  const { startUpload } = useUploadFiles(generateUploadUrl, {
    onUploadBegin: () => {
      toast(
        <div className="flex w-full flex-col">
          <p>Uploading files...</p>
          <Progress value={0} />
        </div>,
        {
          id: "uploading-toast",
        },
      )
    },
    onUploadProgress: (progress) => {
      toast(
        <div className="flex w-full flex-col">
          <p>Uploading files...</p>
          <Progress value={progress} />
        </div>,
        {
          id: "uploading-toast",
        },
      )
    },
    onUploadError: () =>
      toast.error("Upload failed", { id: "uploading-toast" }),
    onUploadComplete: async (files) => {
      toast.loading("Saving files...", { id: "uploading-toast" })
      await saveAfterUpload(files)
      toast.success("Files uploaded", { id: "uploading-toast" })
    },
  })
  async function downloadFileToDisk(storageId: string, name: string) {
    const toastId = toast.loading("Downloading file...")
    const token = await session.getToken({ template: "convex" })
    const file = await downloadFile(storageId, { token })
    const a = document.createElement("a")
    a.href = file.src
    a.download = name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    toast.dismiss(toastId)
  }

  async function handleDeleteFile(storageId: string) {
    const toastId = toast.loading("Deleting file...")
    try {
      await deleteFile({
        storageId,
      })
      toast.success("File deleted successfully", { id: toastId })
    } catch (error) {
      toast.error("Failed to delete file", { id: toastId })
    }
    router.refresh()
  }
  function getFileIcon(type: string, size: "sm" | "md" = "md") {
    if (type === "application/pdf")
      return (
        <FaFilePdf
          className={cn(
            "h-4 w-4 text-red-500",
            size === "sm" ? "h-4 w-4" : "h-6 w-6",
          )}
        />
      )
    if (type.startsWith("image/"))
      return (
        <FaFileImage
          className={cn(
            "h-4 w-4 text-blue-500",
            size === "sm" ? "h-4 w-4" : "h-6 w-6",
          )}
        />
      )
    if (
      type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
      return (
        <FaFileWord
          className={cn(
            "h-4 w-4 text-[#175ABC]",
            size === "sm" ? "h-4 w-4" : "h-6 w-6",
          )}
        />
      )
    if (
      type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
      return (
        <FaFileExcel
          className={cn(
            "h-4 w-4 text-green-500",
            size === "sm" ? "h-4 w-4" : "h-6 w-6",
          )}
        />
      )
    if (type === "text/csv")
      return (
        <FaFileCsv
          className={cn(
            "h-4 w-4 text-yellow-500",
            size === "sm" ? "h-4 w-4" : "h-6 w-6",
          )}
        />
      )
    return (
      <FaFile
        className={cn(
          "h-4 w-4 text-gray-500",
          size === "sm" ? "h-4 w-4" : "h-6 w-6",
        )}
      />
    )
  }

  function handleDeleteFolder() {
    startDeleteFolderTransition(async () => {
      await deleteFolder({
        folderId: folder._id,
      })
      toast.success("Folder deleted successfully")
    })
  }

  return (
    <Collapsible
      open={collapsibleOpen}
      onOpenChange={setCollapsibleOpen}
      className={cn(collapsibleOpen ? "mb-1" : "mb-0 h-8")}
    >
      <div className="flex w-full items-center justify-between rounded-none text-foreground">
        <CollapsibleTrigger className="group" asChild>
          <button className="flex h-8 items-center gap-2 rounded-none px-0 text-sm text-foreground">
            <LucideChevronDown className="w-4 -rotate-90 group-data-[state=open]:rotate-0" />
            <LucideFolder className="h-4 w-4 text-primary" />
            <span>{folder.name}</span>
          </button>
        </CollapsibleTrigger>
        {editable && (
          <div className="flex items-center gap-1">
            <input
              id={`file-upload-input-${folder._id}`}
              type="file"
              multiple
              onChange={(event) => {
                const files = Array.from(event.target.files ?? [])
                if (files.length === 0) return
                startUpload(files)
                setCollapsibleOpen(true)
              }}
              hidden
            />
            <label
              htmlFor={`file-upload-input-${folder._id}`}
              className={buttonVariants({
                size: "sm",
                variant: "ghost",
                className:
                  "flex !h-7 w-min cursor-pointer items-center gap-2 text-xs",
              })}
            >
              <LucideUpload className="h-3 w-3" />
              Upload
            </label>
            <AlertDialog>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="!h-7 w-7">
                        <LucideTrash className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    Delete folder
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    this folder and all its files.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteFolder}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
      <CollapsibleContent className="ml-2 mt-2 flex w-full flex-col gap-1 border-l pl-3 pr-2 data-[state=closed]:p-0">
        {files.map((file) => (
          <Dialog key={file._id}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="flex w-full items-center justify-start gap-2 rounded-sm border bg-card px-3 py-6"
              >
                <div className="shrink-0">{getFileIcon(file.type, "sm")}</div>
                <div className="relative flex flex-col items-start overflow-hidden">
                  <span className="w-full truncate font-medium">
                    {file.name}
                  </span>
                  <span className="-mt-0.5 whitespace-nowrap text-xs font-normal text-muted-foreground">
                    {formatDate(new Date(file._creationTime), "MMM dd, yyyy")}
                  </span>
                </div>
              </Button>
            </DialogTrigger>
            <DialogContent
              forceMount
              aria-describedby="file-content"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getFileIcon(file.type)}
                  <span className="truncate">{file.name}</span>
                </DialogTitle>
                <DialogDescription hidden>
                  File content for {file.name}
                </DialogDescription>
                <div className="flex justify-end pt-1">
                  <div className="flex w-min rounded-md border p-1 shadow-sm">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              downloadFileToDisk(file.storageId, file.name)
                            }
                          >
                            <LucideDownload className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">Download</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {editable && (
                      <AlertDialog>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <LucideTrash className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              Delete
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete this file.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteFile(file.storageId)}
                            >
                              Continue
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </DialogHeader>
              <div className="flex h-full w-full items-center justify-center overflow-auto px-6 py-4">
                {file.type.startsWith("image/") ? (
                  <StorageImage storageId={file.storageId} />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2">
                    {getFileIcon(file.type, "md")}
                    <span className="text-xs text-muted-foreground">
                      Download the file to view its content
                    </span>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}
