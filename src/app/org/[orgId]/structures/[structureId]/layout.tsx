import { auth } from "@clerk/nextjs/server"
import { fetchQuery, preloadQuery } from "convex/nextjs"
import { type ReactNode } from "react"
import { api } from "../../../../../../convex/_generated/api"
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
  const user = auth()
  const token = (await user.getToken({ template: "convex" })) ?? undefined
  const [structure, currentOrgStructureUser] = await Promise.all([
    preloadQuery(
      api.structures.getById,
      {
        id: structureId,
      },
      { token },
    ),
    fetchQuery(
      api.users.getCurrentOrgStructureUser,
      {
        orgId: "1",
        structureId: structureId,
      },
      { token },
    ),
  ])

  if (!structure._valueJSON || !currentOrgStructureUser) return children

  return (
    <div className="flex h-full flex-col">
      <StructureNav
        preloadedStructure={structure}
        currentStructureUser={currentOrgStructureUser}
      />
      <div className="min-h-0 w-full grow">{children}</div>
    </div>
  )
}
