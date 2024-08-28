import {
  auth,
  clerkClient,
  currentUser,
  Organization,
  OrganizationMembershipPublicUserData,
} from "@clerk/nextjs/server"
import { fetchQuery } from "convex/nextjs"
import Image from "next/image"
import Link from "next/link"
import { buttonVariants } from "~/components/ui/button"
import { api } from "../../../../../convex/_generated/api"
import { Doc } from "../../../../../convex/_generated/dataModel"
import ErrorDisplay from "../../../../components/ErrorDisplay"
import { getAuthToken } from "../../../auth"
import MyStructures from "./_components/my-structures"

interface Props {
  params: {
    orgSlug: string
  }
}

export default async function StructuresPage({ params: { orgSlug } }: Props) {
  const session = auth()
  const user = await currentUser()
  const token = await getAuthToken()
  let myStructures: Doc<"structures">[]
  let org: Organization | null = null
  let orgMembers: OrganizationMembershipPublicUserData[] = []
  try {
    if (!orgSlug.startsWith("user_")) {
      org = await clerkClient().organizations.getOrganization({
        slug: orgSlug,
      })
      const members = (
        await clerkClient().organizations.getOrganizationMembershipList({
          organizationId: org.id,
        })
      ).data.map((member) => member.publicUserData)
      orgMembers = members
        .filter((member) => member !== null && member !== undefined)
        .map((member) => ({ ...member }))
    }
    myStructures = await fetchQuery(
      api.structures.getAllOfMyInOrgId,
      {
        orgId: org?.id ?? null,
      },
      { token },
    )
  } catch (error) {
    return <ErrorDisplay error={error} />
  }

  return (
    <div className="container mx-auto flex flex-col gap-4 px-4 py-8">
      <div className="flex justify-between px-2">
        <div className="flex items-center gap-4">
          <Image
            src={org?.imageUrl ?? user!.imageUrl}
            alt={org?.name ?? user!.fullName ?? "Personal"}
            width={40}
            height={40}
            className="rounded-md"
          />
          <h1 className="text-4xl font-bold">{org?.name ?? "Personal"}</h1>
        </div>
        {(session.orgRole === "org:admin" ||
          (!session.orgId && !session.orgRole)) && (
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
        orgId={org?.id ?? null}
        myPrefetchedStructures={myStructures}
        orgMembers={orgMembers}
      />
    </div>
  )
}
