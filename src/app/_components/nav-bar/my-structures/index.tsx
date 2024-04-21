import { api } from "~/trpc/server"
import MyStructuresSelect from "./my-structures-select"

export default async function MyStructures() {
  const myStructures = await api.structure.getAllOfMy()

  if (myStructures.length === 0) return null

  return <MyStructuresSelect myStructures={myStructures} />
}
