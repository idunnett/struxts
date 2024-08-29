"use client"

import { Authenticated } from "convex/react"
import { ErrorBoundary } from "next/dist/client/components/error-boundary"
import ErrorDisplay from "../../../../../../../../../components/ErrorDisplay"
import { TabsContent } from "../../../../../../../../../components/ui/tabs"
import Folders from "./_components/Folders"

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
  return (
    <TabsContent
      value="files"
      className="flex min-h-0 flex-col gap-4 data-[state=active]:grow"
    >
      <Authenticated>
        <ErrorBoundary
          errorComponent={(error) => (
            <ErrorDisplay error={error} type="component" />
          )}
        >
          <Folders structureId={structureId} nodeId={nodeId} />
        </ErrorBoundary>
      </Authenticated>
    </TabsContent>
  )
}
