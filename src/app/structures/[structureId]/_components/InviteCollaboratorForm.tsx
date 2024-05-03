import { Mail } from "lucide-react"
import { useState } from "react"
import Spinner from "~/components/Spinner"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { useDebounce } from "~/hooks/useDebounce"
import { api } from "~/trpc/react"
import AddCollaborator from "./AddCollaborator"

interface Props {
  structureId: number
}

export default function InviteCollaboratorForm({ structureId }: Props) {
  const [initialCollaborators] =
    api.user.getStructureCollaborators.useSuspenseQuery(structureId)
  const [collaborators, setCollaborators] = useState(initialCollaborators)

  const [searchValue, setSearchValue] = useState("")
  const debouncedSearchValue = useDebounce(searchValue)

  const { data: users, isFetching } = api.user.search.useQuery(
    debouncedSearchValue,
    {
      placeholderData: (previousData) => previousData,
    },
  )
  return (
    <>
      <div className="flex items-center space-x-2">
        <div className="relative grid flex-1 gap-2">
          <Label htmlFor="link" className="sr-only">
            Invite Collaborator
          </Label>
          <Input
            id="user-search"
            placeholder="example@email.com"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          {isFetching && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2">
              <Spinner />
            </div>
          )}
        </div>
        <Button
          type="submit"
          variant="secondary"
          size="sm"
          className="gap-2 px-3"
          disabled
        >
          <Mail className="h-4 w-4" />
          Invite
        </Button>
      </div>
      <div className="flex flex-col gap-1">
        {users?.map((user) => (
          <AddCollaborator
            key={user.id}
            collaborators={collaborators}
            structureId={structureId}
            user={user}
            onAddCollaborator={(user) =>
              setCollaborators((prev) => [...prev, user])
            }
          />
        ))}
      </div>
    </>
  )
}
