import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server"
import { fetchQuery } from "convex/nextjs"
import { type ReactNode } from "react"
import { api } from "../../../../convex/_generated/api"
import ErrorDisplay from "../../../components/ErrorDisplay"
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
  const token = await convexAuthNextjsToken()
  let structure: typeof api.structures.getById._returnType
  let nodes: typeof api.nodes.getByStructureId._returnType
  let edges: typeof api.edges.getByStructureId._returnType
  let currentOrgStructureUser: typeof api.orgStructureUsers.getCurrent._returnType
  let structureMembers: typeof api.structures.getMembers._returnType
  try {
    structure = await fetchQuery(
      api.structures.getById,
      {
        id: structureId,
      },
      { token },
    )
    if (!structure)
      return <ErrorDisplay statusCode={404} message="Structure not found" />
    ;[nodes, edges, currentOrgStructureUser, structureMembers] =
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
            structureId: structure._id,
          },
          { token },
        ),
        fetchQuery(
          api.structures.getMembers,
          {
            structureId: structure._id,
          },
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

    // orgStructureMembers = (
    //   await Promise.all(
    //     orgStructureUsers.map(async (orgStructureUser) => {
    //       if (!orgStructureUser) return null
    //       const clerkUser = await clerkClient().users.getUser(
    //         orgStructureUser.userId,
    //       )
    //       if (!clerkUser) return null
    //       return {
    //         ...orgStructureUser,
    //         imageUrl: clerkUser.imageUrl,
    //         primaryEmailAddress:
    //           clerkUser.primaryEmailAddress?.emailAddress ?? null,
    //         fullName: clerkUser.fullName,
    //         firstName: clerkUser.firstName,
    //         lastName: clerkUser.lastName,
    //       } satisfies ClerkOrgStructureUser
    //     }),
    //   )
    // ).filter((user) => user !== null)
  } catch (error) {
    return <ErrorDisplay error={error} />
  }

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
          structureMembers={structureMembers}
        />
        <div className="min-h-0 w-full grow">{children}</div>
      </div>
    </StructureProvider>
  )
}
