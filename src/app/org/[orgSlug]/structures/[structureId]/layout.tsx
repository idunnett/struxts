import { fetchQuery } from "convex/nextjs"
import { type ReactNode } from "react"
import { api } from "../../../../../../convex/_generated/api"
import { getAuthToken } from "../../../../auth"
import StructureNav from "./_components/StructureNav"

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
  const token = await getAuthToken()
  const structure = await fetchQuery(
    api.structures.getById,
    {
      id: structureId,
    },
    { token },
  )

  if (!structure) return children

  return (
    <div className="flex h-full flex-col">
      <StructureNav prefetchedStructure={structure} />
      <div className="min-h-0 w-full grow">{children}</div>
    </div>
  )
}
