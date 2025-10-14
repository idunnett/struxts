import { Doc } from "convex/_generated/dataModel"
import DeleteStructureForm from "./DeleteStructureForm"
import EditStructureNameForm from "./EditStructureNameForm"

interface Props {
  structure: Doc<"structures">
}

export default function SettingsMenuItem({ structure }: Props) {
  return (
    <div className="flex h-full w-full flex-col items-center gap-4 overflow-auto px-6">
      <EditStructureNameForm structure={structure} />
      <DeleteStructureForm structureId={structure._id} />
    </div>
  )
}
