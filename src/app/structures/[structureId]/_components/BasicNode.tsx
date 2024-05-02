"use client"

import { Info, Trash } from "lucide-react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import TipTapEditor from "./TipTapEditor"

export default function BasicNode({
  id,
  data,
  selected,
  dragging,
}: NodeProps<NodeData>) {
  const [infoPopoverOpen, setInfoPopoverOpen] = useState(false)
  const [popoverSide, setPopoverSide] = useState<
    "top" | "right" | "bottom" | "left"
  >("left")
  const [popovoerSideOffset, setPopoverSideOffset] = useState(10)
  const [popoverAlignOffset, setPopoverAlignOffset] = useState(-18)

  function handlePopoverOpen() {
    setInfoPopoverOpen(true)
    setTimeout(() => {
      const popoverContent = document.getElementById(`popover-${id}`)
      if (!popoverContent) return
      const side = popoverContent.getAttribute("data-side")
      if (side === "right") {
        setPopoverSide("bottom")
        setPopoverSideOffset(22)
        setPopoverAlignOffset(-10)
      } else {
        setPopoverSide("left")
        setPopoverSideOffset(10)
        setPopoverAlignOffset(-18)
      }
    }, 10)
  }

  function handlePopoverClose() {
    setInfoPopoverOpen(false)
    setTimeout(() => {
      setPopoverSide("left")
    }, 100)
  }

  return (
    <Popover open={selected && data.editable && !dragging && !infoPopoverOpen}>
      <PopoverTrigger asChild>
        <div
          id={id}
          className={cn(
            "relative w-[162px] cursor-pointer rounded-sm border border-foreground/50 bg-card p-2",
            data.label.length > 10 && "pl-3",
            data.label.length > 11 && "pl-4",
            data.label.length > 12 && "pl-5",
            data.label.length > 13 && "pl-6",
            data.label.length > 14 && "pl-7",
            data.label.length > 15 && "pl-8",
            selected && "ring-2 ring-blue-500/50 ring-offset-1",
            dragging && "cursor-grabbing",
          )}
        >
          <LineWrappingInput
            value={data.label}
            onChange={(e) => data.onLabelChange?.(id, e.target.value)}
            className={cn(
              "w-full break-words bg-transparent text-center text-sm outline-none",
              dragging && "cursor-grabbing",
            )}
            readOnly={!data.editable}
          />
          <Popover
            open={infoPopoverOpen}
            onOpenChange={(open) => {
              if (open) handlePopoverOpen()
              else handlePopoverClose()
            }}
          >
            <PopoverTrigger
              asChild
              className="absolute left-1 top-1/2 -translate-y-1/2"
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onMouseDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setInfoPopoverOpen(true)
                }}
              >
                <Info className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              id={`popover-${id}`}
              side={popoverSide}
              align="start"
              alignOffset={popoverAlignOffset}
              sideOffset={popovoerSideOffset}
              className="w-[500px]"
            >
              <Tabs defaultValue="account" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="account">Info</TabsTrigger>
                  <TabsTrigger value="password">Files</TabsTrigger>
                </TabsList>
                <TabsContent value="account">
                  <TipTapEditor
                    editable={data.editable}
                    info={data.info}
                    onInfoUpdate={(info) => data.onInfoChange?.(id, info)}
                  />
                </TabsContent>
              </Tabs>
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
      </PopoverTrigger>
      <PopoverContent side="top" sideOffset={12} className="w-fit p-2">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            onClick={() => data?.onDelete?.(id)}
          >
            <Trash className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
