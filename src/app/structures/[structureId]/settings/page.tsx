import { notFound } from "next/navigation"
import { api } from "~/trpc/server"
import EditStructureNameForm from "./_components/EditStructureNameForm"
import DeleteStructureForm from "./_components/DeleteStructureForm"

interface Props {
  params: {
    structureId: string
  }
}

export default async function StructureSettingsPage({
  params: { structureId },
}: Props) {
  const structure = await api.structure.getById(Number(structureId))

  if (!structure) notFound()

  return (
    <div className="flex h-full w-full flex-col items-center gap-4 overflow-auto p-8">
      <EditStructureNameForm structure={structure} />
      <DeleteStructureForm structureId={structure.id} />
    </div>
  )
}
