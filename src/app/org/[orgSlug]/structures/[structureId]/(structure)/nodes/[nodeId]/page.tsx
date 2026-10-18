import { redirect } from "next/navigation"

interface Props {
  params: Promise<{
    orgSlug: string
    structureId: string
    nodeId: string
  }>
}

export default async function NodePage({ params }: Props) {
  const { orgSlug, structureId, nodeId } = await params
  redirect(`/org/${orgSlug}/structures/${structureId}/nodes/${nodeId}/info`)
}
