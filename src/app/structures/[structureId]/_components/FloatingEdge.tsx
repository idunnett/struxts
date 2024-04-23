import { useCallback } from "react"
import { useStore, type EdgeProps, getStraightPath } from "reactflow"
import { getEdgeParams } from "./edgeUtils"

export default function FloatingEdge({
  id,
  source,
  target,
  markerEnd,
  style,
}: EdgeProps) {
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

  return (
    <path
      id={id}
      className="fill-none stroke-muted-foreground stroke-1"
      d={edgePath}
      markerEnd={markerEnd}
      style={style}
    />
  )
}
