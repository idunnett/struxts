"use client"

import { Info, Trash, Circle, CircleSlash } from "lucide-react"
import { useEffect, useState } from "react"
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
import TipTapEditor from "../TipTapEditor"
import { colours } from "~/lib/constants"

export default function BasicNode({
  id,
  data,
  selected,
  dragging,
}: NodeProps<NodeData>) {
  const [toolbarPopoverOpen, setToolbarPopoverOpen] = useState(false)
  const [infoPopoverOpen, setInfoPopoverOpen] = useState(false)
  const [focused, setFocused] = useState(false)
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
    })
  }

  function handlePopoverClose() {
    setInfoPopoverOpen(false)
    setTimeout(() => {
      setPopoverSide("left")
    }, 100)
  }

  useEffect(() => {
    if (dragging) setToolbarPopoverOpen(false)
  }, [dragging])

  return (
    <Popover
      open={
        selected &&
        data.editable &&
        !dragging &&
        !infoPopoverOpen &&
        toolbarPopoverOpen
      }
      onOpenChange={(open) =>
        !open && !focused && !selected && setToolbarPopoverOpen(false)
      }
    >
      <PopoverTrigger asChild>
        <div
          id={id}
          className={cn(
            "relative w-[162px] cursor-pointer rounded-sm border p-2",
            data.label.length > 10 && "pl-3",
            data.label.length > 11 && "pl-4",
            data.label.length > 12 && "pl-5",
            data.label.length > 13 && "pl-6",
            data.label.length > 14 && "pl-7",
            data.label.length > 15 && "pl-8",
            selected && "ring-2 ring-blue-500/50 ring-offset-1",
            dragging && "cursor-grabbing",
          )}
          style={{
            borderColor: data.borderColor,
            backgroundColor: data.bgColor,
          }}
          onClick={() => setToolbarPopoverOpen(true)}
          onDoubleClick={() => {
            if (focused) return
            setFocused(true)
            setTimeout(() => {
              const input = document.getElementById(
                `line-wrapping-input-${id}`,
              ) as HTMLTextAreaElement
              if (!input) return
              input.select()
            })
          }}
        >
          <LineWrappingInput
            id={`line-wrapping-input-${id}`}
            value={data.label}
            onChange={(e) =>
              data.onNodeDataChange?.(id, { label: e.target.value })
            }
            className={cn(
              "nodrag w-full break-words bg-transparent text-center text-sm outline-none",
              dragging && "cursor-grabbing",
            )}
            readOnly={!data.editable || !focused}
            onBlur={() => setFocused(false)}
          />
          <Popover
            open={infoPopoverOpen}
            onOpenChange={(open) => {
              if (!open) handlePopoverClose()
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
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (!infoPopoverOpen) handlePopoverOpen()
                  setToolbarPopoverOpen(false)
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
              onDoubleClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
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
                    onInfoUpdate={(info) =>
                      data.onNodeDataChange?.(id, { info })
                    }
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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                style={{
                  color: data.borderColor,
                }}
              >
                {data.borderColor === "transparent" ? (
                  <CircleSlash className="h-4 w-4 stroke-muted-foreground" />
                ) : (
                  <Circle
                    strokeWidth={5}
                    className="h-4 w-4 rounded-full border fill-muted stroke-current"
                  />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              side="top"
              sideOffset={12}
              className="flex w-fit max-w-96 flex-wrap items-center justify-center gap-1 p-2"
            >
              {colours.map((colour) => (
                <button
                  key={colour.value}
                  className="rounded-full border transition-all hover:border-blue-500/50"
                  style={{
                    color: colour.value,
                  }}
                  onClick={() =>
                    data.onNodeDataChange?.(id, {
                      borderColor: colour.value,
                    })
                  }
                >
                  {colour.value === "transparent" ? (
                    <CircleSlash className="stroke-muted-foreground" />
                  ) : (
                    <Circle className="fill-current stroke-current" />
                  )}
                </button>
              ))}
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                style={{
                  color: data.bgColor,
                }}
              >
                {data.bgColor === "transparent" ? (
                  <CircleSlash className="h-4 w-4 stroke-muted-foreground" />
                ) : (
                  <Circle className="h-4 w-4 rounded-full border fill-current stroke-current" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              side="top"
              sideOffset={12}
              className="flex w-fit max-w-96 flex-wrap items-center justify-center gap-1 p-2"
            >
              {colours.map((colour) => (
                <button
                  key={colour.value}
                  className="rounded-full border transition-all hover:border-blue-500/50"
                  style={{
                    color: colour.value,
                  }}
                  onClick={() =>
                    data.onNodeDataChange?.(id, {
                      bgColor: colour.value,
                    })
                  }
                >
                  {colour.value === "transparent" ? (
                    <CircleSlash className="stroke-muted-foreground" />
                  ) : (
                    <Circle className="fill-current stroke-current" />
                  )}
                </button>
              ))}
            </PopoverContent>
          </Popover>
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
