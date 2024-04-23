import { BaseEdge, type EdgeProps, getStraightPath } from "reactflow"

export default function BasicEdge(props: EdgeProps) {
  const { sourceX, sourceY, targetX, targetY } = props

  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  })

  return <BaseEdge {...props} path={edgePath} />
}
