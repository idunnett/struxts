import {
  EdgeLabelRenderer,
  getStraightPath,
  useInternalNode,
  type EdgeProps,
} from "@xyflow/react"
import { Circle, LucideTrash2 } from "lucide-react"
import { nanoid } from "nanoid"
import { useEffect, useRef } from "react"
import updateInputWidth from "update-input-width"
import { Button } from "~/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { colours } from "~/lib/constants"
import { cn } from "~/lib/utils"
import { type TFloatingEdge } from "~/types"
import { Input } from "../../../../../components/ui/input"
import { Slider } from "../../../../../components/ui/slider"
import { getEdgeParams } from "../../_utils/edgeUtils"

export default function FloatingEdge({
  id,
  source,
  target,
  data,
  markerEnd,
  selected,
  style,
  interactionWidth,
}: EdgeProps<TFloatingEdge>) {
  // Adjust this value between 0 and 100 to control label position
  const sourceNode = useInternalNode(source)
  const targetNode = useInternalNode(target)
  if (!sourceNode || !targetNode) return null

  const {
    sx,
    sy,
    tx,
    ty,
    // sourcePos, targetPos
  } = getEdgeParams(sourceNode, targetNode)

  const [edgePath] = getStraightPath({
    sourceX: sx,
    sourceY: sy,
    // sourcePosition: sourcePos,
    // targetPosition: targetPos,
    targetX: tx,
    targetY: ty,
  })

  function handelAddLabel() {
    const newId = `reactflow__${nanoid()}`
    data?.onEdgeDataChange?.(id, {
      labels: [...(data?.labels ?? []), { id: newId, label: "", offset: 50 }],
    })
    setTimeout(() => document.getElementById(`label-input-${newId}`)?.focus())
  }
  function calculateOffsetPosition(
    sx: number,
    sy: number,
    tx: number,
    ty: number,
    offset: number,
  ) {
    const offsetX = sx + ((tx - sx) * offset) / 100
    const offsetY = sy + ((ty - sy) * offset) / 100
    return { offsetX, offsetY }
  }

  return (
    <>
      <path
        key={markerEnd}
        id={id}
        fill="none"
        className={cn(
          "stroke-current stroke-2 marker:fill-current",
          selected && "outline-dashed outline-blue-500/50",
          !data?.editable && "pointer-events-none",
        )}
        d={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          color: data?.color,
        }}
      />
      {!!data?.editable && (
        <Popover open={selected && data?.editable}>
          <PopoverTrigger asChild disabled={!data?.editable}>
            <path
              d={edgePath}
              fill="none"
              strokeOpacity={0}
              strokeWidth={interactionWidth ?? 20}
              className="react-flow__edge-interaction"
            />
          </PopoverTrigger>
          <PopoverContent
            className="flex w-fit flex-col gap-1 p-2"
            side="top"
            sideOffset={12}
          >
            <div className="flex gap-2">
              <Button
                disabled={data?.labels.length > 2}
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={handelAddLabel}
              >
                + Label
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    style={{
                      color: data?.color ?? "#000000",
                    }}
                  >
                    <Circle
                      strokeWidth={3}
                      className="h-4 w-4 rounded-full border fill-current stroke-current"
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  side="top"
                  sideOffset={12}
                  className="flex w-fit max-w-96 flex-wrap items-center justify-center gap-1 p-2"
                >
                  {colours
                    .filter((c) => c.value !== "transparent")
                    .map((colour) => (
                      <button
                        key={colour.value}
                        className="rounded-full border transition-all hover:border-blue-500/50"
                        style={{
                          color: colour.value,
                        }}
                        onClick={() =>
                          data?.onEdgeDataChange?.(id, {
                            color: colour.value,
                          })
                        }
                      >
                        <Circle className="fill-current stroke-current" />
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
                <LucideTrash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
            {data?.labels.map(({ id: labelId, label, offset }, index) => (
              <div
                key={labelId}
                className="flex flex-col gap-1 rounded-md border p-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs text-muted-foreground">
                    Label {index + 1}
                  </h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      data?.onEdgeDataChange?.(id, {
                        labels: data.labels.filter((l) => l.id !== labelId),
                      })
                    }}
                  >
                    <LucideTrash2 className="h-3 w-3 text-red-500" />
                  </Button>
                </div>
                <div className="flex flex-col gap-3">
                  <Input
                    id={`label-input-${labelId}`}
                    value={label ?? ""}
                    className="h-8"
                    onChange={(e) => {
                      const labelIndex = data?.labels.findIndex(
                        (l) => l.id === labelId,
                      )
                      if (labelIndex === -1) return
                      const newLabels = [...data.labels]
                      newLabels[labelIndex]!.label = e.target.value
                      data?.onEdgeDataChange?.(id, {
                        labels: newLabels,
                      })
                    }}
                  />
                  <Slider
                    defaultValue={[50]}
                    max={100}
                    step={1}
                    value={[offset]}
                    onValueChange={([value]) => {
                      if (value === undefined) return
                      const labelIndex = data?.labels.findIndex(
                        (l) => l.id === labelId,
                      )
                      if (labelIndex === -1) return
                      const newLabels = [...data.labels]
                      newLabels[labelIndex]!.offset = value
                      data?.onEdgeDataChange?.(id, {
                        labels: newLabels,
                      })
                    }}
                  />
                </div>
              </div>
            ))}
          </PopoverContent>
        </Popover>
      )}
      <EdgeLabelRenderer>
        {data?.labels.map(({ id: labelId, label, offset }) => {
          const { offsetX, offsetY } = calculateOffsetPosition(
            sx,
            sy,
            tx,
            ty,
            offset,
          )
          return (
            <EdgeLabel
              key={labelId}
              id={labelId}
              transform={`translate(-50%, -50%) translate(${offsetX}px,${offsetY}px)`}
              label={label ?? ""}
              editable={!!data.editable}
              onChange={(value) => {
                const labelIndex = data?.labels.findIndex(
                  (l) => l.id === labelId,
                )
                if (labelIndex === -1) return
                const newLabels = [...data.labels]
                newLabels[labelIndex]!.label = value
                data?.onEdgeDataChange?.(id, {
                  labels: newLabels,
                })
              }}
            />
          )
        })}
      </EdgeLabelRenderer>
    </>
  )
}

// this is a little helper component to render the actual edge label
function EdgeLabel({
  id,
  transform,
  label,
  editable,
  onChange,
  // groupHovering,
}: {
  id: string
  transform?: string
  label: string
  editable: boolean
  // groupHovering: boolean
  onChange: (value: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!inputRef.current) return
    updateInputWidth(inputRef.current)
  }, [label])

  return (
    <div
      style={{
        transform,
      }}
      className="pointer-events-auto absolute border-[10px] border-transparent bg-background bg-clip-padding px-1 py-0.5 text-xs"
    >
      <input
        ref={inputRef}
        id={`edge-label-input-${id}`}
        className="pointer-events-auto min-w-4 bg-transparent text-center outline-none ring-blue-500/50 ring-offset-1 focus:ring-1"
        value={label}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        disabled={!editable}
      />
    </div>
  )
}
