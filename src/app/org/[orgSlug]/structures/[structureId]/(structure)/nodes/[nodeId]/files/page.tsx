"use client"

import { useAuth } from "@clerk/nextjs"
import { UploadButton, UploadFileResponse } from "@xixixao/uploadstuff/react"
import { useMutation } from "convex/react"
import { ErrorBoundary } from "next/dist/client/components/error-boundary"
import { api } from "../../../../../../../../../../convex/_generated/api"
import ErrorDisplay from "../../../../../../../../../components/ErrorDisplay"
import { buttonVariants } from "../../../../../../../../../components/ui/button"
import { TabsContent } from "../../../../../../../../../components/ui/tabs"
import FilesTable from "./_components/FilesTable"

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
      className="data-state-[active]:grow flex min-h-0 flex-col gap-4"
    >
      <UploadButton
        className={(progress) =>
          buttonVariants({ className: "w-32 cursor-pointer" })
        }
        uploadUrl={generateUploadUrl}
        fileTypes={[".pdf", "image/*", ".txt", ".docx", ".xlsx", ".csv"]}
        multiple
        onUploadComplete={saveAfterUpload}
        onUploadError={(error: unknown) => alert(`ERROR! ${error}`)}
      />
      <ErrorBoundary
        errorComponent={(error) => (
          <ErrorDisplay error={error} type="component" />
        )}
      >
        <FilesTable structureId={structureId} nodeId={nodeId} />
      </ErrorBoundary>
    </TabsContent>
  )
}
