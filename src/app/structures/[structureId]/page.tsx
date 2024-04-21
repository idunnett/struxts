import { redirect } from "next/navigation"
import { api } from "~/trpc/server"

export default async function StructurePage({
  params: { structureId },
}: {
  params: { structureId: string }
}) {
  const structure = await api.structure.getById(Number(structureId))

  if (!structure) redirect("/")

  return (
    <div>
      <h1>{structure.name}</h1>
      <p>Structures are the building blocks of your application.</p>
    </div>
  )
}
