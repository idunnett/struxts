"use client"

import { useAuth } from "@clerk/nextjs"
import { LucideX } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ReactNode, use } from "react"
import { Button } from "../../../../../../../../components/ui/button"
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "../../../../../../../../components/ui/tabs"
import { StructureContext } from "../../../_components/StructureProvider"

interface Props {
  children: ReactNode
  params: {
    orgSlug: string
    structureId: string
    nodeId: string
  }
}

export default function NodePage({
  params: { orgSlug, structureId, nodeId },
  children,
}: Props) {
  const {
    activeNode,
    resizable: { separatorProps, x },
    nodesInitialized,
  } = use(StructureContext)
  const session = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  if (!activeNode && !nodesInitialized) return null
  if (!activeNode)
    return router.replace(`/org/${orgSlug}/structures/${structureId}`)
  return (
    <>
      <div
        {...separatorProps}
        className="relative z-50 w-[2px] cursor-ew-resize bg-secondary hover:bg-primary/50 active:bg-primary"
      >
        <div className="absolute left-0 top-0 h-full w-[800%] -translate-x-1/2 bg-transparent"></div>
      </div>
      <div
        className="relative z-50 flex h-full flex-col gap-2 bg-card p-4 pb-0 shadow-lg"
        style={{
          width: `${x}px`,
        }}
      >
        {/* <div className="absolute  top-0">Hide Info</div> */}
        <div className="flex items-start justify-between gap-2">
          {/* <h2 className="text-lg font-semibold">{activeNode.data.label}</h2> */}
          <h2 className="text-lg font-semibold">{activeNode.data.label}</h2>
          <Button variant="ghost" size="icon" className="h-8" asChild>
            <Link href={`/org/${orgSlug}/structures/${structureId}`}>
              <LucideX className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <Tabs
          defaultValue={pathname.endsWith("files") ? "files" : "info"}
          className="relative flex min-h-0 w-full grow flex-col"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info" asChild>
              <Link
                href={`/org/${orgSlug}/structures/${structureId}/nodes/${nodeId}/info`}
              >
                Info
              </Link>
            </TabsTrigger>
            <TabsTrigger value="files" asChild>
              <Link
                href={`/org/${orgSlug}/structures/${structureId}/nodes/${nodeId}/files`}
              >
                Files
              </Link>
            </TabsTrigger>
          </TabsList>
          {children}
        </Tabs>
      </div>
    </>
  )
}
