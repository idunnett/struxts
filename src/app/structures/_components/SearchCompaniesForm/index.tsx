import { useQuery } from "convex/react"
import { LucideSearch } from "lucide-react"
import { useState } from "react"
import Spinner from "~/components/Spinner"
import { Input } from "~/components/ui/input"
import { useDebounce } from "~/hooks/useDebounce"
import { api } from "../../../../../convex/_generated/api"
import { Button } from "../../../../components/ui/button"
import AddCompany from "./AddCompany"

interface Props {
  structureId: string
  nodePosition: { x: number; y: number }
  onCreateNewCompany: () => void
  onAddCompany: () => void
}

export default function SearchCompaniesForm({
  structureId,
  nodePosition,
  onCreateNewCompany,
  onAddCompany,
}: Props) {
  const [searchValue, setSearchValue] = useState("")
  const debouncedSearchValue = useDebounce(searchValue)

  const companies = useQuery(api.companies.search, {
    query: debouncedSearchValue,
  })

  return (
    <div className="flex h-full w-full flex-col gap-2 px-6">
      <div className="flex items-center space-x-2">
        <div className="relative flex grow items-center space-x-2">
          <Input
            id="user-search"
            placeholder="Search companies"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
            {!companies ? (
              <Spinner className="text-muted-foreground" />
            ) : (
              <LucideSearch className="mr-2 h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
        <Button size="sm" className="text-xs" onClick={onCreateNewCompany}>
          + Create New Company
        </Button>
      </div>
      <div className="flex w-full flex-col gap-1 overflow-auto">
        {companies?.map((company) => (
          <AddCompany
            key={company._id}
            structureId={structureId}
            company={company}
            nodePosition={nodePosition}
            onAddCompany={onAddCompany}
          />
        ))}
      </div>
      {!companies?.length && debouncedSearchValue.length > 0 && (
        <div className="flex h-full w-full items-center justify-center">
          <span className="text-xs text-muted-foreground">
            No results found...
          </span>
        </div>
      )}
    </div>
  )
}
