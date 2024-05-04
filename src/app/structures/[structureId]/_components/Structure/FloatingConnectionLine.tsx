import {
  type ConnectionLineComponentProps,
  type Node,
  getStraightPath,
} from "reactflow"
import { getEdgeParams } from "../../_utils/edgeUtils"

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

  const targetNode: Node = {
    id: "connection-target",
    width: 1,
    height: 1,
    positionAbsolute: { x: toX, y: toY },
    data: null,
    position: { x: toX, y: toY },
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
