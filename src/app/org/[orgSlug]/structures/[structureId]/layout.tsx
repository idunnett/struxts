import { auth } from "@clerk/nextjs/server"
import { fetchQuery } from "convex/nextjs"
import { type ReactNode } from "react"
import { api } from "../../../../../../convex/_generated/api"
import ErrorDisplay from "../../../../../components/ErrorDisplay"
import { getAuthToken } from "../../../../auth"
import StructureNav from "./_components/StructureNav"
import StructureProvider from "./_components/StructureProvider"

interface Props {
  children: ReactNode
  params: {
    structureId: string
  }
}

export default async function StructureLayout({
  children,
  params: { structureId },
}: Props) {
  const session = auth()
  const token = await getAuthToken()
  const structure = await fetchQuery(
    api.structures.getById,
    {
      id: structureId,
    },
    { token },
  )

  if (!structure) return children

  const [nodes, edges, /*files,*/ currentOrgStructureUser] = await Promise.all([
    fetchQuery(
      api.nodes.getByStructureId,
      { structureId: structure._id },
      { token },
    ),
    fetchQuery(
      api.edges.getByStructureId,
      { structureId: structure._id },
      { token },
    ),
    // api.file.getByStructureId(structure.id),
    fetchQuery(
      api.orgStructureUsers.getCurrent,
      {
        orgId: session.orgId ?? null,
        structureId: structure._id,
      },
      { token },
    ),
  ])

  if (!currentOrgStructureUser) {
    return (
      <ErrorDisplay
        error={403}
        message="You are not a member of this structure"
      />
    )
  }

  return (
    <StructureProvider
      prefetchedNodes={nodes}
      prefetchedEdges={edges}
      structure={structure}
      currentOrgStructureUser={currentOrgStructureUser}
    >
      <div className="flex h-full flex-col">
        <StructureNav prefetchedStructure={structure} />
        <div className="min-h-0 w-full grow">{children}</div>
      </div>
    </StructureProvider>
  )
}
