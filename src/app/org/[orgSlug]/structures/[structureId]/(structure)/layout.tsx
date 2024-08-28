"use client"

import dynamic from "next/dynamic"
import { ReactNode } from "react"
import Spinner from "../../../../../../components/Spinner"

interface Props {
  children: ReactNode
}

export default function StructurePage({ children }: Props) {
  const Structure = dynamic(() => import("./_components/Structure"), {
    ssr: false,
    loading: (props) => {
      console.log({ ...props })
      return (
        <div className="flex h-full w-full items-center justify-center">
          <Spinner />
        </div>
      )
    },
  })
  return <Structure>{children}</Structure>
}
