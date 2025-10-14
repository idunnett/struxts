import { useMutation } from "convex/react"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { Button } from "~/components/ui/button"
import { api } from "../../../../../convex/_generated/api"
import { Doc } from "../../../../../convex/_generated/dataModel"

interface Props {
  structureId: string
  company: Doc<"companies">
  nodePosition: { x: number; y: number }
  onAddCompany: () => void
}

export default function AddCompany({
  structureId,
  company,
  nodePosition,
  onAddCompany,
}: Props) {
  const [isAddingCompany, startAddingCompanyTransition] = useTransition()
  const addCompany = useMutation(api.companies.addToStructure)
  const router = useRouter()

  return (
    <div className="flex w-full items-center justify-between gap-8 rounded-md border px-2 py-1.5 text-sm">
      <div className="flex items-center gap-2">
        {/* <Image
          src={orgMember.imageUrl}
          alt={orgMember.fullName ?? "User Picture"}
          className="h-6 w-6 rounded-full"
          width={24}
          height={24}
        /> */}
        <div className="flex flex-col">
          <span className="text-sm">{company.name}</span>
          <span className="text-xs">
            {[company.city, company.stateProvince, company.country]
              .filter(Boolean)
              .join(", ")}
          </span>
        </div>
      </div>
      <Button
        size="sm"
        variant="secondary"
        className="h-8 text-xs"
        onClick={() =>
          startAddingCompanyTransition(async () => {
            console.log({ nodePosition })
            await addCompany({
              structureId,
              companyId: company._id,
              x: nodePosition.x,
              y: nodePosition.y,
            })
            router.refresh()
            onAddCompany()
          })
        }
        disabled={isAddingCompany}
      >
        <div className="flex items-center gap-1">
          <Plus className="h-3 w-3" />
          Add
        </div>
      </Button>
    </div>
  )
}
