"use client"

import { Doc } from "../../../../../../../../../convex/_generated/dataModel"
import { useCurrentOrg } from "~/hooks/useCurrentOrg"
import DeleteStructureForm from "./DeleteStructureForm"
import EditStructureNameForm from "./EditStructureNameForm"

interface Props {
  structure: Doc<"structures">
}

export default function SettingsMenuItem({ structure }: Props) {
  const { orgId } = useCurrentOrg()
  return (
    <div className="flex h-full w-full flex-col items-center gap-4 overflow-auto px-6">
      <EditStructureNameForm orgId={orgId} structure={structure} />
      <DeleteStructureForm orgId={orgId} structureId={structure._id} />
    </div>
  )
}
