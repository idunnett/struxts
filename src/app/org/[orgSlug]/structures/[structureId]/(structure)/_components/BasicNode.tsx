"use client"

import { Handle, Position, type NodeProps } from "@xyflow/react"
import {
  Circle,
  CircleSlash,
  LucideMaximize2,
  LucideMinimize2,
  LucideTrash,
} from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import LineWrappingInput from "react-line-wrapping-input"
import { Button, buttonVariants } from "~/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { cn } from "~/lib/utils"
import { type TBasicNode } from "~/types"
import ColourPicker from "../../../../../../../components/ColourPicker"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../../../../../../components/ui/alert-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../../../../../components/ui/tooltip"

export default function BasicNode({
  id,
  data,
  selected,
  dragging,
}: NodeProps<TBasicNode>) {
  const [toolbarPopoverOpen, setToolbarPopoverOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const params = useParams() as { orgSlug: string; structureId: string }
  const router = useRouter()

  return (
    <Popover
      open={selected && data.editable && !dragging && toolbarPopoverOpen}
      onOpenChange={(open) =>
        !open && !focused && !selected && setToolbarPopoverOpen(false)
      }
    >
      <PopoverTrigger
        id={id}
        className={cn(
          "group relative w-[162px] cursor-pointer rounded-sm border p-2 shadow-sm",
          dragging && "cursor-grabbing shadow-xl",
        )}
        style={{
          borderColor: data.borderColour,
          backgroundColor: data.bgColour,
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
        {selected && !dragging && data.editable && (
          <div className="absolute left-1/2 top-1/2 h-[calc(100%+20px)] w-[calc(100%+20px)] -translate-x-1/2 -translate-y-1/2 border border-dashed border-ring/50 bg-transparent" />
        )}
        <Link
          href={
            data.isActive
              ? `/org/${params.orgSlug}/structures/${params.structureId}`
              : `/org/${params.orgSlug}/structures/${params.structureId}/nodes/${id}/info`
          }
          className={buttonVariants({
            variant: "ghost",
            size: "icon",
            className: cn(
              "absolute -right-3 -top-3 !h-6 !w-6 rounded-full border bg-card p-1 shadow-md",
              !dragging && "group-hover:opacity-100",
              data.isActive ? "opacity-100" : "opacity-0",
            ),
          })}
        >
          {data.isActive ? (
            <LucideMinimize2 className="h-3.5 w-3.5" />
          ) : (
            <LucideMaximize2 className="h-3.5 w-3.5" />
          )}
        </Link>
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
      </PopoverTrigger>
      <PopoverContent
        side="top"
        sideOffset={12}
        className="!z-40 w-fit p-1"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex items-center gap-1">
          <Popover>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-xs"
                      style={{
                        color: data.borderColour,
                      }}
                    >
                      {data.borderColour === "transparent" ? (
                        <CircleSlash className="h-4 w-4 stroke-muted-foreground" />
                      ) : (
                        <Circle
                          strokeWidth={5}
                          className="h-4 w-4 rounded-full border fill-muted stroke-current"
                        />
                      )}
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  Border Colour
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <PopoverContent
              side="top"
              sideOffset={12}
              className="w-fit max-w-96 p-2"
            >
              <ColourPicker
                onColourChoose={(colour) =>
                  data.onNodeDataChange?.(id, {
                    borderColour: colour,
                  })
                }
              />
            </PopoverContent>
          </Popover>
          <Popover>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-xs"
                      style={{
                        color: data.bgColour,
                      }}
                    >
                      {data.bgColour === "transparent" ? (
                        <CircleSlash className="h-4 w-4 stroke-muted-foreground" />
                      ) : (
                        <Circle className="h-4 w-4 rounded-full border fill-current stroke-current" />
                      )}
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  Background Colour
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <PopoverContent
              side="top"
              sideOffset={12}
              className="w-fit max-w-96 p-2"
            >
              <ColourPicker
                onColourChoose={(colour) =>
                  data.onNodeDataChange?.(id, {
                    bgColour: colour,
                  })
                }
              />
            </PopoverContent>
          </Popover>
          <div className="h-6 w-px bg-secondary" />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-xs"
              >
                <LucideTrash className="h-4 w-4 text-red-500" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all
                  information and files attached to this node.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    data?.onDelete?.(id)
                    router.replace(
                      `/org/${params.orgSlug}/structures/${params.structureId}`,
                    )
                  }}
                >
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </PopoverContent>
    </Popover>
  )
}
