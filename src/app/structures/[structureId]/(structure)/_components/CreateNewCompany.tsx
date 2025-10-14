import { useMutation } from "convex/react"
import { useRouter } from "next/navigation"
import { FormEvent, useState, useTransition } from "react"
import { api } from "../../../../../../convex/_generated/api"
import { Doc } from "../../../../../../convex/_generated/dataModel"
import { Button } from "../../../../../components/ui/button"
import CompanyForm from "../nodes/[nodeId]/info/_components/CompanyForm"

interface Props {
  structureId: string
  nodePosition: {
    x: number
    y: number
  }
  onCancel: () => void
  onSave: () => void
}

export default function CreateNewCompany({
  structureId,
  nodePosition,
  onCancel,
  onSave,
}: Props) {
  const [company, setCompany] = useState<
    Omit<
      Doc<"companies"> & {
        owners: (Doc<"companyOwners"> & { user: Doc<"users"> })[]
      },
      "_id" | "_creationTime"
    >
  >({
    city: "",
    country: "",
    description: "",
    name: "",
    employees: "",
    yearFounded: undefined,
    website: "",
    logo: "",
    stateProvince: "",
    owners: [],
  })
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const createCompany = useMutation(api.companies.create)
  const addCompanyNodeToStructure = useMutation(api.companies.addToStructure)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    startTransition(async () => {
      // @ts-expect-error - owners is not a valid property of the company object
      delete company.owners
      const companyId = await createCompany({
        company,
      })

      await addCompanyNodeToStructure({
        companyId,
        structureId: structureId,
        x: nodePosition.x,
        y: nodePosition.y,
      })
      router.refresh()
      onSave()
    })
  }

  return (
    <form
      className="flex flex-col gap-4 overflow-auto px-6 py-2"
      onSubmit={handleSubmit}
    >
      <CompanyForm
        isNew
        editable={true}
        company={company}
        onCompanyUpdate={(updates) => setCompany({ ...company, ...updates })}
      />
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{isPending ? "Saving..." : "Save"}</Button>
      </div>
    </form>
  )
}
