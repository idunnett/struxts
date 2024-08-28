import { useOrganization } from "@clerk/nextjs"
import { Doc } from "../../../../../../../../../convex/_generated/dataModel"
import DeleteStructureForm from "./DeleteStructureForm"
import EditStructureNameForm from "./EditStructureNameForm"

interface Props {
  structure: Doc<"structures">
}

export default function SettingsMenuItem({ structure }: Props) {
  const org = useOrganization()
  return (
    <div className="flex h-full w-full flex-col items-center gap-4 overflow-auto px-6">
      <EditStructureNameForm
        orgId={org.organization?.id ?? null}
        structure={structure}
      />
      <DeleteStructureForm
        orgId={org.organization?.id ?? null}
        structureId={structure._id}
      />
    </div>
  )
}
