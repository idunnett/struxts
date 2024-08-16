// import { api } from "~/trpc/server"

interface Props {
  params: {
    structureId: string
  }
}

export default async function StructurePage({
  params: { structureId },
}: Props) {
  // const structure = await api.structure.getById(Number(structureId))
  // const structure = await preloadQuery(api.structures.getById, {
  //   id: structureId,
  // })

  // if (!structure._valueJSON) notFound()
  // // const [nodes, edges, files, currentStructureUser] = await Promise.all([
  // //   api.node.getByStructureId(structure.id),
  // //   api.edge.getByStructureId(structure.id),
  // //   api.file.getByStructureId(structure.id),
  // //   api.user.getCurrentStructureUser(structure.id),
  // // ])

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

  return null
  // return (
  //   <Structure2
  //     // structure={structure}
  //     // initialNodes={nodes}
  //     // initialEdges={edges}
  //     // initialFiles={files}
  //     // currentStructureUser={currentStructureUser}
  //   />
  // )
}
