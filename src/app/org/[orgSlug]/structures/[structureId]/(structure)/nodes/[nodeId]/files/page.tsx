"use client"

import { useAuth } from "@clerk/nextjs"
import { UploadButton, UploadFileResponse } from "@xixixao/uploadstuff/react"
import { useMutation } from "convex/react"
import { ErrorBoundary } from "next/dist/client/components/error-boundary"
import { api } from "../../../../../../../../../../convex/_generated/api"
import ErrorDisplay from "../../../../../../../../../components/ErrorDisplay"
import { buttonVariants } from "../../../../../../../../../components/ui/button"
import { TabsContent } from "../../../../../../../../../components/ui/tabs"
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
        <Files structureId={structureId} nodeId={nodeId} />
      </ErrorBoundary>
    </TabsContent>
  )
}
