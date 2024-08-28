"use client"

import dynamic from "next/dynamic"
import { ReactNode, useMemo } from "react"
import Spinner from "../../../../../../components/Spinner"

interface Props {
  children: ReactNode
}

export default function StructurePage({ children }: Props) {
  const Structure = useMemo(
    () =>
      dynamic(() => import("./_components/Structure"), {
        ssr: false,
        loading: () => {
          return (
            <div className="flex h-full w-full items-center justify-center">
              <Spinner />
            </div>
          )
        },
      }),
    [],
  )
  return <Structure>{children}</Structure>
}
