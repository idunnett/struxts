import { preloadQuery } from "convex/nextjs"
import { api } from "../../../../../convex/_generated/api"
import MyOrgsSelect from "./my-orgs-select"

export default async function MyOrgs() {
  const myOrgs = await preloadQuery(api.orgs.getAllOfMy)

  return <MyOrgsSelect myPreloadedOrgs={myOrgs} />
}
