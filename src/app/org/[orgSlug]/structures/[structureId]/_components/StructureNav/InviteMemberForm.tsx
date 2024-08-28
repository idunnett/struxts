import { PopoverAnchor } from "@radix-ui/react-popover"
import ky from "ky"
import { LucideSearch } from "lucide-react"
import { useEffect, useState } from "react"
import Spinner from "../../../../../../../components/Spinner"
import { Input } from "../../../../../../../components/ui/input"
import {
  Popover,
  PopoverContent,
} from "../../../../../../../components/ui/popover"
import { useDebounce } from "../../../../../../../hooks/useDebounce"
import {
  ClerkOrgStructureUser,
  ClerkUserData,
} from "../../../../../../../types"
import AddMember from "./MembersMenuItem/AddMember"

interface Props {
  orgId: string
  structureId: string
  orgStructureMembers: ClerkOrgStructureUser[]
}

export default function InviteMemberForm({
  orgId,
  structureId,
  orgStructureMembers,
}: Props) {
  const [searchValue, setSearchValue] = useState("")
  const [isFetching, setIsFetching] = useState(false)
  const debouncedSearchValue = useDebounce(searchValue)
  const [orgMembers, setOrgMembers] = useState<ClerkUserData[]>([])
  const [searchResultsOpen, setSearchResultsOpen] = useState(false)
  const [inputIsFocused, setInputIsFocused] = useState(false)

  useEffect(() => {
    if (debouncedSearchValue.length < 3) return setOrgMembers([])
    async function searchOrgMembers() {
      setIsFetching(true)
      const data = await ky<ClerkUserData[]>(`/api/org/${orgId}/users/search`, {
        searchParams: {
          query: debouncedSearchValue,
        },
      }).json()
      setIsFetching(false)
      setOrgMembers(data)
    }
    searchOrgMembers()
  }, [debouncedSearchValue])

  return (
    <Popover open={searchResultsOpen}>
      <PopoverAnchor asChild>
        <div className="relative mx-4 flex items-center space-x-2">
          <Input
            id="user-search"
            placeholder="Search org members"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => {
              setInputIsFocused(true)
              setSearchResultsOpen(true)
            }}
            onBlur={() => setInputIsFocused(false)}
          />
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
            {isFetching ? (
              <Spinner className="text-muted-foreground" />
            ) : (
              <LucideSearch className="mr-2 h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </PopoverAnchor>
      <PopoverContent
        align="start"
        side="bottom"
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="max-h-[--radix-popover-content-available-height]96 w-[--radix-popover-trigger-width]"
        onFocusOutside={() => {
          if (!inputIsFocused) setSearchResultsOpen(false)
        }}
      >
        {debouncedSearchValue.length < 3 && (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-xs text-muted-foreground">
              Type at least 3 characters to search...
            </span>
          </div>
        )}
        {debouncedSearchValue.length > 2 && (
          <div className="flex w-full flex-col gap-1 overflow-auto">
            {orgMembers.map((orgMember) => (
              <AddMember
                key={orgMember.userId}
                orgId={orgId}
                orgStructureMembers={orgStructureMembers}
                structureId={structureId}
                orgMember={orgMember}
                onAddMember={() => {
                  setSearchResultsOpen(false)
                  setSearchValue("")
                  setInputIsFocused(false)
                }}
              />
            ))}
          </div>
        )}
        {!orgMembers.length && isFetching && (
          <div className="flex h-full w-full items-center justify-center">
            <Spinner />
          </div>
        )}
        {!orgMembers.length &&
          !isFetching &&
          debouncedSearchValue.length > 2 && (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-xs text-muted-foreground">
                No results found...
              </span>
            </div>
          )}
      </PopoverContent>
    </Popover>
  )
}
