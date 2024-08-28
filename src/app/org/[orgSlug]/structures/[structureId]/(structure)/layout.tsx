"use client"

import dynamic from "next/dynamic"
import { ReactNode } from "react"

interface Props {
  children: ReactNode
}

const Structure = dynamic(() => import("./_components/Structure"), {
  ssr: false,
})

export default async function StructurePage({ children }: Props) {
  return <Structure>{children}</Structure>
}
