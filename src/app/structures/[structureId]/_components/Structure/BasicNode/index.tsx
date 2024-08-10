"use client"

import { Circle, CircleSlash, Trash } from "lucide-react"
import { useEffect, useState } from "react"
import LineWrappingInput from "react-line-wrapping-input"
import { Handle, Position, type NodeProps } from "reactflow"
import { Button } from "~/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { colours } from "~/lib/constants"
import { cn } from "~/lib/utils"
import { type NodeData } from "~/types"

export default function BasicNode({
  id,
  data,
  selected,
  dragging,
}: NodeProps<NodeData>) {
  const [toolbarPopoverOpen, setToolbarPopoverOpen] = useState(false)
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (dragging) setToolbarPopoverOpen(false)
  }, [dragging])

  return (
    <Popover
      open={selected && data.editable && !dragging && toolbarPopoverOpen}
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
            data.isActive && "ring-2 ring-blue-500/50 ring-offset-1",
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
