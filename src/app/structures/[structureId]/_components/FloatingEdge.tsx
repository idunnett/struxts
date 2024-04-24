import { useCallback, useMemo, useState } from "react"
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

export default function FloatingEdge({
  id,
  source,
  target,
  data,
  markerEnd,
  style,
  selected,
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

  const [edgePath] = getStraightPath({
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
  return (
    <>
      <path
        id={id}
        className={cn(
          "fill-none stroke-foreground stroke-1",
          selected && "stroke-primary stroke-2",
        )}
        d={edgePath}
        markerEnd={markerEnd}
        style={style}
      />
      <EdgeLabelRenderer>
        {(!!data?.startLabel || data?.editable) && (
          <EdgeLabel
            transform={`translate(${getXTranslate(sx, sourceNode)}%, ${getYTanslate(sy, sourceNode)}%) translate(${sx}px,${sy}px)`}
            label={data.startLabel ?? ""}
            editable={!!data.editable}
            onChange={(label) => data.onStartLabelChange?.(id, label)}
          />
        )}
        {(!!data?.endLabel || !!data?.editable) && (
          <EdgeLabel
            transform={`translate(${getXTranslate(tx, targetNode)}%, ${getYTanslate(ty, targetNode)}%) translate(${tx}px,${ty}px)`}
            label={data.endLabel ?? ""}
            editable={!!data.editable}
            onChange={(label) => data.onEndLabelChange?.(id, label)}
          />
        )}
      </EdgeLabelRenderer>
    </>
  )
}

// this is a little helper component to render the actual edge label
function EdgeLabel({
  transform,
  label,
  editable,
  onChange,
}: {
  transform: string
  label: string
  editable: boolean
  onChange: (label: string) => void
}) {
  const [hovering, setHovering] = useState(false)
  const [focused, setFocused] = useState(false)

  const showInput = useMemo(() => hovering || focused, [hovering, focused])

  return (
    <div
      style={{
        transform,
      }}
      className={cn(
        "pointer-events-auto absolute border-[10px] border-transparent bg-background bg-clip-padding px-1 py-0.5 text-xs",
        !showInput && !label.length && "opacity-0",
      )}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {editable && showInput ? (
        <input
          className="pointer-events-auto w-24 bg-transparent px-1 text-center outline-none ring-1 ring-muted-foreground ring-offset-1"
          value={label}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      ) : (
        <span className="truncate">{label}</span>
      )}
    </div>
  )
}
