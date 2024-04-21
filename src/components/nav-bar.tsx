import { redirect } from "next/navigation"
import { getServerAuthSession } from "~/server/auth"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { api } from "~/trpc/server"
import SignOutButton from "./signout-button"

export default async function NavBar() {
  const session = await getServerAuthSession()
  if (!session?.user) redirect("/api/auth/signin")

  const myStructures = await api.structure.getMy()

  return (
    <nav className="h-16 w-full border-b px-8 py-2">
      <div className="flex h-full items-center justify-between">
        <div className="flex h-full items-center gap-8">
          <h1 className="text-xl font-bold">Struxts</h1>
          {myStructures.length > 0 && (
            <>
              <div className="bg-border h-3/4 w-[1px]" />
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a structure" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>My Structures</SelectLabel>
                    {myStructures.map((structure) => (
                      <SelectItem
                        key={structure.id}
                        value={structure.id.toString()}
                      >
                        {structure.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </>
          )}
        </div>
        <div>
          <SignOutButton />
        </div>
      </div>
    </nav>
  )
}
