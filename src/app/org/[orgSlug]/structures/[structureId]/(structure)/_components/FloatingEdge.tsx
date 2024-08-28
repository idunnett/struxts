import {
  EdgeLabelRenderer,
  getStraightPath,
  useInternalNode,
  type EdgeProps,
} from "@xyflow/react"
import { Circle, LucideTrash, LucideTrash2 } from "lucide-react"
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
import { Input } from "../../../../../../../components/ui/input"
import { Slider } from "../../../../../../../components/ui/slider"
import { getEdgeParams } from "../_utils/edgeUtils"

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

  if (
    isNaN(sourceNode.position.x) ||
    isNaN(sourceNode.position.y) ||
    isNaN(targetNode.position.x) ||
    isNaN(targetNode.position.y)
  )
    return null

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
    const labels = data?.labels ?? []
    data?.onEdgeDataChange?.(id, {
      labels: [...labels, { label: "", offset: 50 }],
    })
    setTimeout(() =>
      document
        .getElementById(`edge-${id}-label-input-${labels.length}`)
        ?.focus(),
    )
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
          selected && "outline-dashed outline-ring",
          !data?.editable && "pointer-events-none",
        )}
        d={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          color: data?.colour ?? "#000000",
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
            className="flex w-fit flex-col gap-1 p-1"
            side="top"
            sideOffset={12}
          >
            <div className="flex items-center gap-1">
              <Button
                disabled={data?.labels.length > 2}
                size="sm"
                variant="ghost"
                className="h-8 text-xs"
                onClick={handelAddLabel}
              >
                + Label
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-xs"
                    style={{
                      color: data?.colour ?? "#000000",
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
                            colour: colour.value,
                          })
                        }
                      >
                        <Circle className="fill-current stroke-current" />
                      </button>
                    ))}
                </PopoverContent>
              </Popover>
              <div className="h-6 w-px bg-secondary" />
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-xs"
                onClick={() => data?.onDelete?.(id)}
              >
                <LucideTrash className="h-4 w-4 text-red-500" />
              </Button>
            </div>
            {data?.labels.map(({ label, offset }, index) => (
              <div
                key={index}
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
                      const newLabels = [...data.labels]
                      newLabels.splice(index, 1)
                      data?.onEdgeDataChange?.(id, {
                        labels: newLabels,
                      })
                    }}
                  >
                    <LucideTrash2 className="h-3 w-3 text-red-500" />
                  </Button>
                </div>
                <div className="flex flex-col gap-3">
                  <Input
                    id={`edge-${id}-label-input-${index}`}
                    value={label ?? ""}
                    className="h-8"
                    onChange={(e) => {
                      const newLabels = [...data.labels]
                      newLabels[index]!.label = e.target.value
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
                      const newLabels = [...data.labels]
                      newLabels[index]!.offset = value
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
        {data?.labels.map(({ label, offset }, index) => {
          const { offsetX, offsetY } = calculateOffsetPosition(
            sx,
            sy,
            tx,
            ty,
            offset,
          )
          return (
            <EdgeLabel
              key={index}
              id={`edge-${id}-label-${index}`}
              transform={`translate(-50%, -50%) translate(${offsetX}px,${offsetY}px)`}
              label={label ?? ""}
              editable={!!data.editable}
              onChange={(value) => {
                const newLabels = [...data.labels]
                newLabels[index]!.label = value
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
