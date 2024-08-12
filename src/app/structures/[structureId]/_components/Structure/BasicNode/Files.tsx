"use client"

import {
  LucideCheck,
  LucideChevronLeft,
  LucideEllipsisVertical,
  LucideFileText,
  LucideFolderClosed,
  LucideFolderPlus,
  LucideSlash,
  LucideTrash2,
  LucideX,
} from "lucide-react"
import { nanoid } from "nanoid"
import { useParams } from "next/navigation"
import { Fragment, useMemo, useState } from "react"
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../../../../../components/ui/breadcrumb"
import { Button, buttonVariants } from "../../../../../../components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../../../../components/ui/dropdown-menu"
import { Input } from "../../../../../../components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../../../../components/ui/popover"
import { type FileState } from "../../../../../../types"
import { UploadButton } from "../../../../../_components/uploadthing"
import { getAllFileDescendantsIds, sortFiles } from "../../../_utils/fileUtils"

interface Props {
  files: FileState[]
  editable: boolean
  onFilesChange: (data: FileState[]) => void
  onFileDelete: (id: string) => void
}

const Files: React.FC<Props> = ({
  files,
  editable,
  onFilesChange,
  onFileDelete,
}) => {
  const params = useParams()

  const structureId = useMemo(() => {
    if (!params.structureId) return 0
    const parsed = Number(params.structureId)
    if (isNaN(parsed)) return 0
    return parsed
  }, [params.structureId])

  const [showNewFolderInput, setShowNewFolderInput] = useState(false)
  const [activeParentIds, setActiveParentIds] = useState<string[]>([])
  const [newFolderName, setNewFolderName] = useState("")

  const activeParent = useMemo(() => {
    if (!activeParentIds.length) return null
    const id = activeParentIds[activeParentIds.length - 1] ?? null
    if (!id) return null
    return files.find((f) => f.id === id) ?? null
  }, [activeParentIds, files])

  function onCreateFolder() {
    if (!newFolderName.length) return
    onFilesChange(
      sortFiles([
        ...files,
        {
          id: `reactflow__${nanoid()}`,
          key: null,
          isFolder: true,
          name: newFolderName,
          url: null,
          parentId: activeParent?.id ?? null,
        },
      ]),
    )
    setShowNewFolderInput(false)
    setNewFolderName("")
  }

  return (
    <div className="relative flex min-h-0 grow flex-col items-start justify-start pb-2">
      <div className="flex w-full items-center justify-start gap-2 border-b pb-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-9"
          disabled={!activeParentIds.length}
          onClick={() =>
            setActiveParentIds(
              activeParentIds.slice(0, activeParentIds.length - 1),
            )
          }
        >
          <LucideChevronLeft className="h-4 w-4" />
        </Button>
        <Breadcrumb>
          <BreadcrumbList className="text-xs">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <button onClick={() => setActiveParentIds([])}>
                  <BreadcrumbSeparator>
                    <LucideSlash className="h-4 w-4" />
                  </BreadcrumbSeparator>
                </button>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {activeParentIds.length > 2 ? (
              <>
                <BreadcrumbItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-1">
                      <BreadcrumbEllipsis className="h-4 w-4" />
                      <span className="sr-only">Toggle menu</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {activeParentIds.map((id, index) => {
                        if (index === activeParentIds.length - 1) return null
                        const file = files.find((f) => f.id === id)
                        if (!file) return null
                        return (
                          <DropdownMenuItem key={id}>
                            <button
                              onClick={() =>
                                setActiveParentIds(
                                  activeParentIds.slice(0, index + 1),
                                )
                              }
                            >
                              {file.name}
                            </button>
                          </DropdownMenuItem>
                        )
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <LucideSlash />
                </BreadcrumbSeparator>
              </>
            ) : (
              activeParentIds.map((id, index) => {
                if (index === activeParentIds.length - 1) return null
                const file = files.find((f) => f.id === id)
                if (!file) return null
                return (
                  <Fragment key={id}>
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <button
                          onClick={() =>
                            setActiveParentIds(
                              activeParentIds.slice(0, index + 1),
                            )
                          }
                        >
                          <BreadcrumbPage>{file.name}</BreadcrumbPage>
                        </button>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator>
                      <LucideSlash />
                    </BreadcrumbSeparator>
                  </Fragment>
                )
              })
            )}
            {activeParent && (
              <BreadcrumbItem>
                <BreadcrumbPage>{activeParent.name}</BreadcrumbPage>
              </BreadcrumbItem>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      {editable && (
        <div className="flex w-full justify-start gap-0.5 pt-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-9"
            onClick={() => setShowNewFolderInput(true)}
          >
            <LucideFolderPlus className="h-4 w-4" />
          </Button>
          <UploadButton
            input={{ structureId }}
            endpoint="fileUploader"
            // content={{
            //   button: (
            //     <div className="flex items-center gap-2">
            //       <LucideUpload className="h-3.5 w-3.5" />
            //       Upload
            //     </div>
            //   ),
            // }}
            appearance={{
              container:
                "flex-row gap-2 ut-uploading:cursor-not-allowed ut-readying:cursor-not-allowed",
              button:
                "h-9 w-28 border-none bg-card px-0 text-xs font-medium text-foreground transition-colors duration-150 focus-within:ring-ring hover:bg-muted after:bg-primary/50 ut-readying:bg-primary/50",
            }}
            onClientUploadComplete={(data) => {
              const tempFiles: FileState[] = []
              for (const d of data) {
                if (!d.serverData) continue
                tempFiles.push({
                  id: `reactflow__${nanoid()}`,
                  key: d.key,
                  isFolder: false,
                  name: d.serverData.name,
                  url: d.serverData.url,
                  parentId: activeParent?.id ?? null,
                })
              }
              onFilesChange([...files, ...tempFiles])
            }}
          />
        </div>
      )}
      <div className="flex h-full min-h-0 w-full grow flex-col overflow-y-auto overflow-x-hidden pt-1">
        {showNewFolderInput && (
          <div className="mb-1 flex !h-10 items-center !justify-start rounded-sm py-1 pl-4 pr-2 hover:bg-transparent">
            <LucideFolderClosed className="mr-2 h-4 w-4 shrink-0" />
            <Input
              autoFocus
              className="h-full rounded-sm rounded-r-none font-medium !outline-none !ring-0 !ring-transparent !ring-offset-transparent focus:border-primary"
              placeholder="New folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDownCapture={(e) => {
                if (e.key !== "Enter") return
                onCreateFolder()
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-full rounded-none"
              onClick={() => {
                setShowNewFolderInput(false)
                setNewFolderName("")
              }}
            >
              <LucideX className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              className="h-full rounded-l-none"
              onClick={onCreateFolder}
            >
              <LucideCheck className="h-4 w-4" />
            </Button>
          </div>
        )}
        {files
          .filter((file) => file.parentId === (activeParent?.id ?? null))
          .map((file) => (
            <div key={file.id} className="relative flex w-full items-center">
              {file.isFolder ? (
                <Button
                  variant="ghost"
                  className="flex h-8 w-full !justify-start overflow-hidden rounded-sm focus-visible:bg-muted/80 focus-visible:ring-0 focus-visible:ring-offset-0"
                  onClick={() =>
                    setActiveParentIds([...activeParentIds, file.id])
                  }
                >
                  <LucideFolderClosed className="mr-2 h-4 w-4" />
                  <span className="truncate">{file.name}</span>
                </Button>
              ) : (
                <a
                  href={file.url ?? ""}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonVariants({
                    variant: "ghost",
                    className:
                      "relative flex h-8 w-full !justify-start overflow-hidden rounded-sm focus-visible:bg-muted/80 focus-visible:ring-0 focus-visible:ring-offset-0",
                  })}
                >
                  <LucideFileText className="mr-2 h-4 w-4" />
                  <span className="truncate">{file.name}</span>
                </a>
              )}
              {editable && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                    >
                      <LucideEllipsisVertical className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-min !p-1"
                    align="start"
                    side="left"
                  >
                    <Button
                      variant="ghost"
                      className="h-8 w-full gap-1 text-xs"
                      onClick={() => {
                        onFileDelete(file.id)
                        const descendants = getAllFileDescendantsIds(
                          files,
                          file.id,
                        )
                        const newFiles = files.filter(
                          (f) => ![file.id, ...descendants].includes(f.id),
                        )
                        onFilesChange(newFiles)
                      }}
                    >
                      <LucideTrash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          ))}
      </div>
    </div>
  )
}
export default Files
