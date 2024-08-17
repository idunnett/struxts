// import { api } from "~/trpc/server"

import { fetchQuery } from "convex/nextjs"
import { notFound } from "next/navigation"
import { api } from "../../../../../../convex/_generated/api"
import Structure2 from "./_components/Structure/index2"

interface Props {
  params: {
    structureId: string
  }
}

export default async function StructurePage({
  params: { structureId },
}: Props) {
  // const structure = await api.structure.getById(Number(structureId))
  const structure = await fetchQuery(api.structures.getById, {
    id: structureId,
  })

  if (!structure) notFound()
  const [nodes /*edges, files, currentStructureUser*/] = await Promise.all([
    fetchQuery(api.nodes.getByStructureId, { structureId: structure._id }),
    // api.edge.getByStructureId(structure.id),
    // api.file.getByStructureId(structure.id),
    // api.user.getCurrentStructureUser(structure.id),
  ])

  // const token = (await auth().getToken({ template: "convex" })) ?? undefined
  // const currentStructureUser = await fetchQuery(
  //   api.users.getCurrentOrgStructureUser,
  //   {
  //     orgId: "1",
  //     structureId: structureId,
  //   },
  //   {
  //     token,
  //   },
  // )

  // if (!currentStructureUser) {
  //   return (
  //     <ErrorDisplay
  //       error={403}
  //       message="You are not a member of this structure"
  //     />
  //   )
  // }

  return (
    <Structure2
      structureId={structure._id}
      prefetchedNodes={nodes}
      // initialEdges={edges}
      // initialFiles={files}
      // currentStructureUser={currentStructureUser}
    />
  )
}
