import { OptionalRestArgsOrSkip, useConvexAuth, useQuery } from "convex/react"
import { FunctionReference } from "convex/server"

export function usePrefetchedAuthQuery<
  Query extends FunctionReference<"query">,
>(
  query: Query,
  prefetchedData: Query["_returnType"],
  ...args: OptionalRestArgsOrSkip<Query>
) {
  const { isLoading } = useConvexAuth()
  if (isLoading) args = ["skip"] as unknown as OptionalRestArgsOrSkip<Query>
  return useQuery(query, ...args) || prefetchedData
}
