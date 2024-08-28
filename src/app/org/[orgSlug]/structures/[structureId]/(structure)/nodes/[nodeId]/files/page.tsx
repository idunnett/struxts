"use client"

import { useAuth } from "@clerk/nextjs"
import { UploadFileResponse, useUploadFiles } from "@xixixao/uploadstuff/react"
import { Authenticated, useMutation } from "convex/react"
import { LucideUpload } from "lucide-react"
import { ErrorBoundary } from "next/dist/client/components/error-boundary"
import { use } from "react"
import { toast } from "sonner"
import { api } from "../../../../../../../../../../convex/_generated/api"
import ErrorDisplay from "../../../../../../../../../components/ErrorDisplay"
import { buttonVariants } from "../../../../../../../../../components/ui/button"
import { Progress } from "../../../../../../../../../components/ui/progress"
import { TabsContent } from "../../../../../../../../../components/ui/tabs"
import { StructureContext } from "../../../../_components/StructureProvider"
import Files from "./_components/Files"

interface Props {
  params: {
    nodeId: string
    structureId: string
    orgSlug: string
  }
}

export default function NodeFilesTabPage({
  params: { nodeId, structureId },
}: Props) {
  const session = useAuth()
  const generateUploadUrl = useMutation(api.files.generateUploadUrl)
  const saveFiles = useMutation(api.files.saveFiles)
  const { editable } = use(StructureContext)

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

  async function saveAfterUpload(files: UploadFileResponse[]) {
    await saveFiles({
      files: files.map(({ response, name, type, size }) => ({
        storageId: (response as { storageId: string }).storageId,
        nodeId,
        orgId: session.orgId ?? null,
        structureId,
        name,
        size,
        type,
      })),
    })
  }

  return (
    <TabsContent
      value="files"
      className="flex min-h-0 flex-col gap-4 data-[state=active]:grow"
    >
      <Authenticated>
        {editable && (
          <>
            <input
              id="file-upload-input"
              type="file"
              multiple
              onChange={(event) => {
                const files = Array.from(event.target.files ?? [])
                if (files.length === 0) return
                startUpload(files)
              }}
              hidden
            />
            <label
              htmlFor="file-upload-input"
              className={buttonVariants({
                variant: "outline",
                className: "flex w-min cursor-pointer items-center gap-2",
              })}
            >
              <LucideUpload className="h-4 w-4" />
              Upload
            </label>
          </>
        )}
        <ErrorBoundary
          errorComponent={(error) => (
            <ErrorDisplay error={error} type="component" />
          )}
        >
          <Files structureId={structureId} nodeId={nodeId} />
        </ErrorBoundary>
      </Authenticated>
    </TabsContent>
  )
}
