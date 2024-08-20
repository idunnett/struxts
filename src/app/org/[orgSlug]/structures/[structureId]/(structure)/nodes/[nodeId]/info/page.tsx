"use client"

import { useMutation } from "convex/react"
import { LucideCircleCheck, LucideRefreshCcw } from "lucide-react"
import { use, useEffect, useRef, useState } from "react"
import { api } from "../../../../../../../../../../convex/_generated/api"
import { TabsContent } from "../../../../../../../../../components/ui/tabs"
import { useDebounce } from "../../../../../../../../../hooks/useDebounce"
import { StructureContext } from "../../../../_components/StructureProvider"
import TipTapEditor from "../../../_components/BasicNode/TipTapEditor"

export default function NodeInfoTabPage() {
  const { activeNode, editable } = use(StructureContext)
  const inputRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState(activeNode!.data.info)
  const debouncedInput = useDebounce(input, 3000)

  const updateNode = useMutation(api.nodes.update)

  useEffect(() => {
    if (!activeNode) return
    setInput(activeNode.data.info)
  }, [activeNode?.data.info])

  useEffect(() => {
    if (!activeNode || debouncedInput === activeNode.data.info) return
    updateNode({
      nodeId: activeNode.id,
      data: {
        info: debouncedInput,
      },
    })
  }, [debouncedInput])
  const saved = input === activeNode?.data.info

  function handleDestroyed() {
    if (!activeNode || input === debouncedInput) return
    updateNode({
      nodeId: activeNode.id,
      data: {
        info: input,
      },
    })
  }

  if (!activeNode) return null
  return (
    <TabsContent
      value="info"
      className="data-state-[active]:grow !mt-0 flex min-h-0 flex-col"
    >
      {editable && (
        <div className="flex items-center gap-1 pt-1 text-xs text-muted-foreground">
          {saved ? (
            <>
              <LucideCircleCheck className="h-3 w-3" />
              <span>Saved</span>
            </>
          ) : (
            <>
              <LucideRefreshCcw className="h-3 w-3" />
              <span>Saving...</span>
            </>
          )}
        </div>
      )}
      <TipTapEditor
        contentRef={inputRef}
        editable={editable}
        info={input}
        onInfoUpdate={setInput}
        onDestroy={handleDestroyed}
      />
    </TabsContent>
  )
}
