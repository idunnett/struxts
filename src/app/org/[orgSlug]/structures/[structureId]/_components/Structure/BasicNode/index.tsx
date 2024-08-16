"use client"

import { Handle, Position, type NodeProps } from "@xyflow/react"
import {
  Circle,
  CircleSlash,
  LucideMaximize2,
  LucideMinimize2,
  Trash,
} from "lucide-react"
import { useEffect, useState } from "react"
import LineWrappingInput from "react-line-wrapping-input"
import { Button } from "~/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { cn } from "~/lib/utils"
import { type TBasicNode } from "~/types"
import ColourPicker from "../../../../../../../../components/ColourPicker"

export default function BasicNode({
  id,
  data,
  selected,
  dragging,
}: NodeProps<TBasicNode>) {
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
      <div
        id={id}
        className={cn(
          "group relative w-[162px] cursor-pointer rounded-sm border p-2",
          data.isActive && "ring-2 ring-primary/25 ring-offset-2",
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
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className={cn(
            "absolute -right-3 -top-3 h-6 w-6 rounded-full border bg-card p-1 shadow-md transition-opacity duration-150 ease-in-out group-hover:opacity-100",
            data.isActive ? "opacity-100" : "opacity-0",
          )}
          onClick={() =>
            data.onShowInfoChange?.(id, !(data.isActive && data.showNodeInfo))
          }
        >
          {data.isActive && data.showNodeInfo ? (
            <LucideMinimize2 className="h-3.5 w-3.5" />
          ) : (
            <LucideMaximize2 className="h-3.5 w-3.5" />
          )}
        </Button>
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
      <PopoverContent side="top" sideOffset={12} className="w-fit p-1">
        <div className="flex items-center gap-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-xs"
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
              className="w-fit max-w-96 p-2"
            >
              <ColourPicker
                onColourChoose={(colour) =>
                  data.onNodeDataChange?.(id, {
                    borderColor: colour,
                  })
                }
              />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-xs"
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
              className="w-fit max-w-96 p-2"
            >
              <ColourPicker
                onColourChoose={(colour) =>
                  data.onNodeDataChange?.(id, {
                    bgColor: colour,
                  })
                }
              />
            </PopoverContent>
          </Popover>
          <div className="h-6 w-px bg-secondary" />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-xs"
            onClick={() => data?.onDelete?.(id)}
          >
            <Trash className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
