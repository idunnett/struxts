import { ReactNode } from "react"
import Structure from "./_components/Structure"

interface Props {
  children: ReactNode
}

export default async function StructurePage({ children }: Props) {
  return <Structure>{children}</Structure>
}
