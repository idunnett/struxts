import { redirect } from "next/navigation"

interface Props {
  params: {
    structureId: string
    nodeId: string
  }
}

export default function NodePage({ params: { structureId, nodeId } }: Props) {
  redirect(`/structures/${structureId}/nodes/${nodeId}/info`)
}
