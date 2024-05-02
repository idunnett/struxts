import { useCallback } from "react"
import {
  useStore,
  type EdgeProps,
  getStraightPath,
  EdgeLabelRenderer,
  type Node,
} from "reactflow"
import { getEdgeParams } from "./edgeUtils"
import { type EdgeData } from "~/types"
import { cn } from "~/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { Button } from "~/components/ui/button"
import { Circle, Trash } from "lucide-react"
import { colours } from "~/lib/constants"

export default function FloatingEdge({
  id,
  source,
  target,
  data,
  markerEnd,
  selected,
  style,
  interactionWidth,
}: EdgeProps<EdgeData>) {
  const sourceNode = useStore(
    useCallback((store) => store.nodeInternals.get(source), [source]),
  )
  const targetNode = useStore(
    useCallback((store) => store.nodeInternals.get(target), [target]),
  )
  if (!sourceNode || !targetNode) return null

  const {
    sx,
    sy,
    tx,
    ty,
    // sourcePos, targetPos
  } = getEdgeParams(sourceNode, targetNode)

  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX: sx,
    sourceY: sy,
    // sourcePosition: sourcePos,
    // targetPosition: targetPos,
    targetX: tx,
    targetY: ty,
  })

  function getXTranslate(x: number, node: Node | undefined) {
    if (x === node?.position.x) return -100
    const width = node?.width ?? 162
    if (x === (node?.position.x ?? 0) + width) return 0

    return -50
  }

  function getYTanslate(y: number, node: Node | undefined) {
    if (y === node?.position.y) return -100
    if (y === (node?.position.y ?? 0) + (node?.height ?? 100)) return 0

    return -50
  }

  function handleAddStartLabel() {
    data?.onEdgeDataChange?.(id, { startLabel: "" })
    setTimeout(() =>
      document.getElementById(`${id}-start-label-input`)?.focus(),
    )
  }
  function handleAddEndLabel() {
    data?.onEdgeDataChange?.(id, { endLabel: "" })
    setTimeout(() => document.getElementById(`${id}-end-label-input`)?.focus())
  }
  function handelAddCenterLabel() {
    data?.onEdgeDataChange?.(id, { label: "" })
    setTimeout(() =>
      document.getElementById(`${id}-middle-label-input`)?.focus(),
    )
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
        )}
        d={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          color: data?.color,
        }}
      />
      <Popover open={selected && data?.editable}>
        <PopoverTrigger asChild>
          <path
            d={edgePath}
            fill="none"
            strokeOpacity={0}
            strokeWidth={interactionWidth ?? 20}
            className="react-flow__edge-interaction"
          />
        </PopoverTrigger>
        <PopoverContent className="w-fit p-2" side="top" sideOffset={12}>
          <div className="flex gap-2">
            <Button
              disabled={data?.startLabel != null}
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={handleAddStartLabel}
            >
              + Start Label
            </Button>
            <Button
              disabled={data?.label != null}
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={handelAddCenterLabel}
            >
              + Center Label
            </Button>
            <Button
              disabled={data?.endLabel != null}
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={handleAddEndLabel}
            >
              + End Label
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
              <Trash className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      <EdgeLabelRenderer>
        {data?.startLabel != null && (
          <EdgeLabel
            id={id}
            labelType="start"
            transform={`translate(${getXTranslate(sx, sourceNode)}%, ${getYTanslate(sy, sourceNode)}%) translate(${sx}px,${sy}px)`}
            label={data.startLabel ?? ""}
            editable={!!data.editable}
            onChange={(startLabel) =>
              data.onEdgeDataChange?.(id, { startLabel })
            }
          />
        )}
        {data?.label != null && (
          <EdgeLabel
            id={id}
            labelType="middle"
            transform={`translate(-50%, -50%) translate(${labelX}px,${labelY}px)`}
            label={data.label ?? ""}
            editable={!!data.editable}
            onChange={(label) => data.onEdgeDataChange?.(id, { label })}
          />
        )}
        {data?.endLabel != null && (
          <EdgeLabel
            id={id}
            labelType="end"
            transform={`translate(${getXTranslate(tx, targetNode)}%, ${getYTanslate(ty, targetNode)}%) translate(${tx}px,${ty}px)`}
            label={data.endLabel ?? ""}
            editable={!!data.editable}
            onChange={(endLabel) => data.onEdgeDataChange?.(id, { endLabel })}
          />
        )}
      </EdgeLabelRenderer>
    </>
  )
}

// this is a little helper component to render the actual edge label
function EdgeLabel({
  id,
  labelType,
  transform,
  label,
  editable,
  onChange,
  // groupHovering,
}: {
  id: string
  labelType: "start" | "end" | "middle"
  transform?: string
  label: string
  editable: boolean
  // groupHovering: boolean
  onChange: (label: string | null) => void
}) {
  return (
    <div
      style={{
        transform,
      }}
      className="pointer-events-auto absolute border-[10px] border-transparent bg-background bg-clip-padding px-1 py-0.5 text-xs"
    >
      {editable ? (
        <input
          id={`${id}-${labelType}-label-input`}
          className="pointer-events-auto w-24 bg-transparent px-1 text-center outline-none ring-muted-foreground ring-offset-1 focus:ring-1"
          value={label}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => {
            if (!label) onChange(null)
          }}
        />
      ) : (
        <span className="truncate">{label}</span>
      )}
    </div>
  )
}
