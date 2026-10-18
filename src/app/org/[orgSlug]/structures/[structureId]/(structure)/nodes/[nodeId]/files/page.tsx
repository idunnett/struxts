"use client"

import { Authenticated } from "convex/react"
import { ErrorBoundary } from "next/dist/client/components/error-boundary"
import { use } from "react"
import ErrorDisplay from "../../../../../../../../../components/ErrorDisplay"
import Spinner from "../../../../../../../../../components/Spinner"
import { TabsContent } from "../../../../../../../../../components/ui/tabs"
import { useCurrentOrg } from "~/hooks/useCurrentOrg"
import Folders from "./_components/Folders"

interface Props {
  params: Promise<{
    nodeId: string
    structureId: string
    orgSlug: string
  }>
}

export default function NodeFilesTabPage({ params }: Props) {
  const { nodeId, structureId } = use(params)
  const { orgId, isLoaded } = useCurrentOrg()

  if (!isLoaded || !orgId) return <Spinner />

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
          <Folders structureId={structureId} nodeId={nodeId} orgId={orgId} />
        </ErrorBoundary>
      </Authenticated>
    </TabsContent>
  )
}
