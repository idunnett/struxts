import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server"
import { fetchQuery } from "convex/nextjs"
import { NextRequest } from "next/server"
import { api } from "../../../../../../../convex/_generated/api"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> },
) {
  const searchParams = req.nextUrl.searchParams
  const query = searchParams.get("query")
  const { orgId } = await params
  const token = await convexAuthNextjsToken()

  if (!token)
    return Response.json({ error: "Unauthorized" }, { status: 401 })

  if (!query)
    return Response.json({ error: "Query is required" }, { status: 400 })
  else if (query.length < 3)
    return Response.json(
      { error: "Query must be at least 3 characters long" },
      { status: 400 },
    )

  try {
    const users = await fetchQuery(
      api.organizations.searchMembers,
      { orgId, query },
      { token },
    )
    return Response.json(users)
  } catch {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }
}
