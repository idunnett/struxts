import { fetchQuery } from "convex/nextjs"
import Image from "next/image"
import Link from "next/link"
import { api } from "../../../../../convex/_generated/api"
import ErrorDisplay from "../../../../components/ErrorDisplay"
import { buttonVariants } from "~/components/ui/button"
import { getAuthToken } from "../../../auth"
import MyStructures from "./_components/my-structures"

interface Props {
  params: Promise<{
    orgSlug: string
  }>
}

export default async function StructuresPage({ params }: Props) {
  const { orgSlug } = await params
  const token = await getAuthToken()
  try {
    const org = await fetchQuery(
      api.organizations.getBySlug,
      { slug: orgSlug },
      { token },
    )
    if (!org)
      return (
        <ErrorDisplay statusCode={404} message="Organization not found" />
      )

    const myStructures = await fetchQuery(
      api.structures.getAllOfMyInOrgId,
      { orgId: org._id },
      { token },
    )

    const canCreate = org.role === "owner" || org.role === "admin"

    return (
      <div className="container mx-auto flex flex-col gap-4 px-4 py-8">
        <div className="flex justify-between px-2">
          <div className="flex items-center gap-4">
            {org.imageUrl ? (
              <Image
                src={org.imageUrl}
                alt={org.name}
                width={40}
                height={40}
                className="rounded-md"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-sm font-bold text-primary">
                {org.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <h1 className="text-4xl font-bold">{org.name}</h1>
          </div>
          {canCreate && (
            <Link
              href={`/org/${orgSlug}/structures/new`}
              className={buttonVariants({
                className: "flex items-center gap-2",
              })}
            >
              <span className="-mt-1 text-2xl font-semibold">+</span>
              <span className="hidden sm:inline">Create a new structure</span>
            </Link>
          )}
        </div>
        <MyStructures
          orgId={org._id}
          orgSlug={orgSlug}
          orgRole={org.role}
          myPrefetchedStructures={myStructures}
        />
      </div>
    )
  } catch (error) {
    return <ErrorDisplay error={error} />
  }
}
