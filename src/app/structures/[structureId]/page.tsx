import { api } from "~/trpc/server"
import Structure from "./_components/Structure"
import { notFound } from "next/navigation"
import ErrorDisplay from "~/components/ErrorDisplay"

interface Props {
  params: {
    structureId: string
  }
}

export default async function StructurePage({
  params: { structureId },
}: Props) {
  const structure = await api.structure.getById(Number(structureId))

  if (!structure) notFound()

  const [nodes, edges, currentStructureUser] = await Promise.all([
    api.node.getByStructureId(structure.id),
    api.edge.getByStructureId(structure.id),
    api.user.getCurrentStructureUser(structure.id),
  ])

  if (!currentStructureUser) {
    return (
      <ErrorDisplay
        statusCode={403}
        message="You are not a member of this structure"
      />
    )
  }

  return (
    <Structure
      structure={structure}
      initialNodes={nodes}
      initialEdges={edges}
      currentStructureUser={currentStructureUser}
    />
  )
}
