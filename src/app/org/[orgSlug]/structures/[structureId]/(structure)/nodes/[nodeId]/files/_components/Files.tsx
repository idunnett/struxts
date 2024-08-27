import { useAuth } from "@clerk/nextjs"
import { useMutation, useQuery } from "convex/react"
import { formatDate } from "date-fns"
import { LucideDownload, LucideTrash } from "lucide-react"
import { useRouter } from "next/navigation"
import { use } from "react"
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
import Spinner from "../../../../../../../../../../components/Spinner"
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
import { Button } from "../../../../../../../../../../components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../../../../../../../components/ui/dialog"
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
  nodeId: string
  structureId: string
}

export default function Files({ nodeId, structureId }: Props) {
  const session = useAuth()
  const files = useQuery(api.files.getByNode, {
    nodeId,
    structureId,
    orgId: session.orgId ?? null,
  })
  const deleteFile = useMutation(api.files.deleteFile)
  const router = useRouter()
  const { editable } = use(StructureContext)
  // function humanFileSize(size: number) {
  //   var i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024))
  //   return (
  //     +(size / Math.pow(1024, i)).toFixed(2) * 1 +
  //     " " +
  //     ["B", "KB", "MB", "GB", "TB"][i]
  //   )
  // }

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
    if (type === "application/pdf") {
      return (
        <FaFilePdf
          className={cn(
            "h-4 w-4 text-red-500",
            size === "sm" ? "h-4 w-4" : "h-6 w-6",
          )}
        />
      )
    }
    if (type.startsWith("image/")) {
      return (
        <FaFileImage
          className={cn(
            "h-4 w-4 text-blue-500",
            size === "sm" ? "h-4 w-4" : "h-6 w-6",
          )}
        />
      )
    }
    if (
      type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return (
        <FaFileWord
          className={cn(
            "h-4 w-4 text-[#175ABC]",
            size === "sm" ? "h-4 w-4" : "h-6 w-6",
          )}
        />
      )
    }
    if (
      type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      return (
        <FaFileExcel
          className={cn(
            "h-4 w-4 text-green-500",
            size === "sm" ? "h-4 w-4" : "h-6 w-6",
          )}
        />
      )
    }
    if (type === "text/csv") {
      return (
        <FaFileCsv
          className={cn(
            "h-4 w-4 text-yellow-500",
            size === "sm" ? "h-4 w-4" : "h-6 w-6",
          )}
        />
      )
    }
    return (
      <FaFile
        className={cn(
          "h-4 w-4 text-gray-500",
          size === "sm" ? "h-4 w-4" : "h-6 w-6",
        )}
      />
    )
  }

  if (!files)
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    )

  return (
    <div className="-mx-4 flex h-full flex-col gap-1 overflow-auto p-4">
      {files.map((file) => (
        <Dialog key={file._id}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center justify-start gap-2 rounded-sm border bg-card px-3 py-6"
            >
              <div className="shrink-0">{getFileIcon(file.type, "sm")}</div>
              <div className="flex flex-col items-start">
                <span className="truncate font-medium">{file.name}</span>
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
                          <TooltipContent side="bottom">Delete</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete this file.
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
    </div>
  )
}
