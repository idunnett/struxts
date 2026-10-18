import { fetchQuery } from "convex/nextjs"
import { type ReactNode } from "react"
import { api } from "../../../../../../convex/_generated/api"
import ErrorDisplay from "../../../../../components/ErrorDisplay"
import type { StructureMemberUser } from "../../../../../types"
import { getAuthToken } from "../../../../auth"
import StructureNav from "./_components/StructureNav"
import StructureProvider from "./_components/StructureProvider"

interface Props {
  children: ReactNode
  params: Promise<{
    orgSlug: string
    structureId: string
  }>
}

export default async function StructureLayout({ children, params }: Props) {
  const { orgSlug, structureId } = await params
  const token = await getAuthToken()
  try {
    const org = await fetchQuery(
      api.organizations.getBySlug,
      { slug: orgSlug },
      { token },
    )
    if (!org)
      return (
        <ErrorDisplay statusCode={404} message="Organization not found" />
      )

    const structure = await fetchQuery(
      api.structures.getById,
      { id: structureId },
      { token },
    )
    if (!structure || structure.orgId !== org._id)
      return <ErrorDisplay statusCode={404} message="Structure not found" />

    const [nodes, edges, currentOrgStructureUser, orgStructureMembers] =
      await Promise.all([
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
        fetchQuery(
          api.orgStructureUsers.getCurrent,
          {
            orgId: org._id,
            structureId: structure._id,
          },
          { token },
        ),
        fetchQuery(
          api.structures.getMembers,
          { structureId: structure._id },
          { token },
        ),
      ])

    if (!currentOrgStructureUser)
      return (
        <ErrorDisplay
          statusCode={403}
          message="You are not a member of this structure"
        />
      )

    return (
      <StructureProvider
        prefetchedNodes={nodes}
        prefetchedEdges={edges}
        structure={structure}
        currentOrgStructureUser={currentOrgStructureUser}
      >
        <div className="flex h-full flex-col">
          <StructureNav
            currentOrgStructureUser={currentOrgStructureUser}
            prefetchedStructure={structure}
            orgStructureMembers={orgStructureMembers as StructureMemberUser[]}
          />
          <div className="min-h-0 w-full grow">{children}</div>
        </div>
      </StructureProvider>
    )
  } catch (error) {
    return <ErrorDisplay error={error} />
  }
}
