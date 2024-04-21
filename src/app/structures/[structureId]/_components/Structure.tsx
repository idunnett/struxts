"use client"

import { useCallback } from "react"
import ReactFlow, {
  type Connection,
  type Edge,
  addEdge,
  useEdgesState,
  useNodesState,
  Controls,
  Background,
  MiniMap,
  BackgroundVariant,
} from "reactflow"

import "reactflow/dist/style.css"

const initialNodes = [
  { id: "1", position: { x: 0, y: 0 }, data: { label: "1" } },
  { id: "2", position: { x: 0, y: 100 }, data: { label: "2" } },
]
const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", type: "smoothstep" },
]

interface Props {
  structure: {
    id: number
    name: string
  }
}

export default function Structure({ structure }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  )

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={initialNodes}
        edges={initialEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      >
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  )
}
