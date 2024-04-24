import Link from "next/link"
import { buttonVariants } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { api } from "~/trpc/server"
import StructureCreatedBy from "./_components/StructureCreatedBy"

export default async function StructuresPage() {
  const myStructures = await api.structure.getAllOfMy()

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex justify-between px-2">
        <h2 className="text-2xl font-medium">Your Structures</h2>
        <Link
          href="/structures/new"
          className={buttonVariants({
            className: "flex items-center gap-2",
          })}
        >
          <span className="-mt-1 text-2xl font-semibold">+</span>
          <span className="hidden sm:inline">Create a new structure</span>
        </Link>
      </div>
      <div className="flex flex-wrap">
        {myStructures.map((structure) => (
          <div key={structure.id} className="w-full p-3 sm:w-1/2 lg:w-1/3">
            <Link href={`/structures/${structure.id}`} className="w-full">
              <Card className="w-full transition-all ease-in-out hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-base">{structure.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <StructureCreatedBy userId={structure.createdById} />
                </CardContent>
              </Card>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
