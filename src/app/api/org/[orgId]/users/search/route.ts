import { clerkClient } from "@clerk/nextjs/server"
import { NextRequest } from "next/server"
import { ClerkUserData } from "../../../../../../types"

export async function GET(
  req: NextRequest,
  { params }: { params: { orgId: string } },
) {
  const searchParams = req.nextUrl.searchParams
  const query = searchParams.get("query")
  const orgId = params.orgId

  if (!query)
    return Response.json({ error: "Query is required" }, { status: 400 })
  else if (query.length < 3)
    return Response.json(
      { error: "Query must be at least 3 characters long" },
      { status: 400 },
    )

  const clerkUsers = await clerkClient().users.getUserList({
    organizationId: [orgId],
    query,
  })

  return Response.json(
    clerkUsers.data.map(
      (user) =>
        ({
          firstName: user.firstName,
          fullName: user.fullName,
          imageUrl: user.imageUrl,
          lastName: user.lastName,
          primaryEmailAddress: user.primaryEmailAddress?.emailAddress ?? null,
          userId: user.id,
        }) satisfies ClerkUserData,
    ),
  )
}
