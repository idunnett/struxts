import Link from "next/link"
import { buttonVariants } from "~/components/ui/button"
import { api } from "~/trpc/server"
import Structure from "./_components/Structure"

export default async function StructurePage({
  params: { structureId },
}: {
  params: { structureId: string }
}) {
  const structure = await api.structure.getById(Number(structureId))

  if (!structure) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-8">
        <div className="flex flex-col items-center justify-center gap-2">
          <h2 className="text-3xl font-bold">404</h2>
          <p className="text-lg">Structure not found</p>
        </div>
        <Link
          href="/structures"
          className={buttonVariants({
            variant: "secondary",
          })}
        >
          Return to dashboard
        </Link>
      </div>
    )
  }

  return <Structure structure={structure} />
}
