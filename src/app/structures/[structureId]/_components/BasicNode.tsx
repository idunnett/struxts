"use client"

import { Info } from "lucide-react"
import { useState } from "react"
import { Handle, type NodeProps, Position } from "reactflow"
import { Button } from "~/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { cn } from "~/lib/utils"
import { type NodeData } from "~/types"
import LineWrappingInput from "react-line-wrapping-input"

export default function BasicNode({ id, data, selected }: NodeProps<NodeData>) {
  const [popoverSide, setPopoverSide] = useState<
    "top" | "right" | "bottom" | "left"
  >("left")

  function handlePopoverOpen() {
    setTimeout(() => {
      const popoverContent = document.getElementById(`popover-${id}`)
      if (!popoverContent) return
      const side = popoverContent.getAttribute("data-side")
      if (side === "right") setPopoverSide("bottom")
      else setPopoverSide("left")
    }, 0)
  }

  return (
    <div
      id={id}
      className={cn(
        "relative w-40 border border-foreground/50 bg-card p-2",
        data.label.length > 10 && "pl-3",
        data.label.length > 11 && "pl-4",
        data.label.length > 12 && "pl-5",
        data.label.length > 13 && "pl-6",
        data.label.length > 14 && "pl-7",
        data.label.length > 15 && "pl-8",
        selected && "ring-1 ring-primary/50",
      )}
    >
      <LineWrappingInput
        value={data.label}
        onChange={(e) => data.onLabelChange?.(id, e.target.value)}
        className="w-full break-words bg-transparent text-center text-sm outline-none "
        readOnly={!data.editable}
        // onMouseDown={(e) => {
        //   console.log("click")
        //   if (!data.editable) {
        //     e.preventDefault()
        //     e.stopPropagation()
        //   }
        // }}
        // tabIndex={data.editable ? 0 : -1}
      />
      <Popover onOpenChange={(open) => open && handlePopoverOpen()}>
        <PopoverTrigger
          asChild
          className="absolute left-1 top-1/2 -translate-y-1/2"
        >
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Info className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          id={`popover-${id}`}
          side={popoverSide}
          align="start"
          alignOffset={-12}
          sideOffset={10}
        >
          Hello there
        </PopoverContent>
      </Popover>
      <Handle
        type="source"
        position={Position.Top}
        id="a"
        className={cn(!data.editable && "hidden")}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="b"
        className={cn(!data.editable && "hidden")}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="c"
        className={cn(!data.editable && "hidden")}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="d"
        className={cn(!data.editable && "hidden")}
      />
    </div>
  )
}
