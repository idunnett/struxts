import {
  type ConnectionLineComponentProps,
  type InternalNode,
  type Node,
  getStraightPath,
} from "@xyflow/react"
import { getEdgeParams } from "../_utils/edgeUtils"

interface Props extends ConnectionLineComponentProps {
  stroke: string
}

function FloatingConnectionLine({
  toX,
  toY,
  // fromPosition,
  // toPosition,
  fromNode,
  stroke,
}: Props) {
  if (!fromNode) return null

  const targetNode: InternalNode<Node> = {
    id: "connection-target",
    width: 1,
    height: 1,
    data: {},
    position: { x: toX, y: toY },
    measured: { width: 1, height: 1 },
    internals: {
      positionAbsolute: { x: toX, y: toY },
      z: 0,
      userNode: {
        id: "connection-target",
        type: "connection-target",
        position: { x: toX, y: toY },
        data: {},
      },
    },
  }

  const { sx, sy } = getEdgeParams(fromNode, targetNode)
  const [edgePath] = getStraightPath({
    sourceX: sx,
    sourceY: sy,
    // sourcePosition: fromPosition,
    // targetPosition: toPosition,
    targetX: toX,
    targetY: toY,
  })

  return (
    <g>
      <path
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        className="animated"
        d={edgePath}
      />
      <circle
        cx={toX}
        cy={toY}
        fill="#fff"
        r={3}
        stroke={stroke}
        strokeWidth={1.5}
      />
    </g>
  )
}

export default FloatingConnectionLine
