"use client"

import { useAuth } from "@clerk/nextjs"
import { Authenticated } from "convex/react"
import { ErrorBoundary } from "next/dist/client/components/error-boundary"
import ErrorDisplay from "../../../../../../../../../components/ErrorDisplay"
import Spinner from "../../../../../../../../../components/Spinner"
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
  const session = useAuth()

  if (!session?.orgId) return <Spinner />

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
          <Folders
            structureId={structureId}
            nodeId={nodeId}
            orgId={session.orgId}
          />
        </ErrorBoundary>
      </Authenticated>
    </TabsContent>
  )
}
