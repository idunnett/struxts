import { type ReactNode } from "react"
import StructureNav from "./_components/StructureNav"
import { api } from "~/trpc/server"

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
  const [structure, currentStructureUser] = await Promise.all([
    api.structure.getById(Number(structureId)),
    api.user.getCurrentStructureUser(Number(structureId)),
  ])

  if (!structure || !currentStructureUser) return children

  return (
    <div className="flex h-full flex-col">
      <StructureNav
        structure={structure}
        currentStructureUser={currentStructureUser}
      />
      <div className="min-h-0 w-full grow">{children}</div>
    </div>
  )
}
