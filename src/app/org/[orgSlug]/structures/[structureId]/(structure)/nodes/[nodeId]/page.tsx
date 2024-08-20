import { redirect } from "next/navigation"

interface Props {
  params: {
    orgSlug: string
    structureId: string
    nodeId: string
  }
}

export default function NodePage({
  params: { orgSlug, structureId, nodeId },
}: Props) {
  redirect(`/org/${orgSlug}/structures/${structureId}/nodes/${nodeId}/info`)
}
