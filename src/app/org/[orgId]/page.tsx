import { fetchQuery } from "convex/nextjs"
import { api } from "../../../../convex/_generated/api"
import { Doc } from "../../../../convex/_generated/dataModel"
import ErrorDisplay from "../../../components/ErrorDisplay"
import { isCustomConvexError } from "../../../lib/utils"
import StructuresPage from "./structures/page"

interface Props {
  params: {
    orgId: string
  }
}

export default async function OrgPage({ params: { orgId } }: Props) {
  let org: Doc<"orgs">
  try {
    org = await fetchQuery(api.orgs.getById, { id: orgId })
  } catch (error) {
    if (isCustomConvexError(error)) {
      return (
        <ErrorDisplay
          statusCode={error.data.statusCode}
          message={error.data.message}
        />
      )
    }
    return (
      <ErrorDisplay
        statusCode={500}
        message="An error occurred while fetching the organization"
      />
    )
  }

  return (
    <div className="container mx-auto flex flex-col p-8">
      <h1 className="text-4xl font-bold">{org.name}</h1>
      <StructuresPage params={{ orgId }} />
    </div>
  )
}
