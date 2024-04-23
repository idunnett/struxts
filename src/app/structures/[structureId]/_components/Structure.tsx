"use client"

import { useCallback, useMemo, useState } from "react"
import ReactFlow, {
  type Connection,
  type Edge,
  type Node,
  addEdge,
  useEdgesState,
  useNodesState,
  Controls,
  MiniMap,
  BackgroundVariant,
  Background,
  ConnectionLineType,
  MarkerType,
  ConnectionMode,
  ControlButton,
  Panel,
} from "reactflow"

import "reactflow/dist/style.css"
import BasicNode from "./BasicNode"
import BasicEdge from "./BasicEdge"
import FloatingEdge from "./FloatingEdge"
import FloatingConnectionLine from "./FloatingConnectionLine"
import { type NodeData } from "~/types"
import { Lock, Unlock } from "lucide-react"
import { Button } from "~/components/ui/button"

const initialNodes: Node<NodeData>[] = [
  {
    id: "1",
    position: { x: 0, y: 0 },
    data: { label: "1", editable: false },
    type: "basic",
  },
  {
    id: "2",
    position: { x: 0, y: 100 },
    data: { label: "2", editable: false },
    type: "basic",
  },
  {
    id: "3",
    position: { x: 200, y: 100 },
    data: { label: "3", editable: false },
    type: "basic",
  },
]
const initialEdges: Edge[] = [
  // { id: "e1-2", source: "1", target: "2", type: "basic", label: "e1-2" },
]

interface Props {
  structure: {
    id: number
    name: string
  }
}

const nodeTypes = { basic: BasicNode }
const edgeTypes = { basic: BasicEdge, floating: FloatingEdge }
const defaultEdgeOptions = { type: "floating" }
const fitViewOptions = { padding: 1 }

export default function Structure({ structure }: Props) {
  const [editable, setEditable] = useState(false)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (params: Edge | Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "floating",
            markerEnd: {
              type: MarkerType.Arrow,
              strokeWidth: 1.5,
              height: 24,
              width: 24,
              color: "hsl(var(--muted-foreground))",
            },
          },
          eds,
        ),
      ),
    [setEdges],
  )

  const onLabelChange = useCallback(
    (id: string, label: string) =>
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === id ? { ...node, data: { ...node.data, label } } : node,
        ),
      ),
    [setNodes],
  )

  // console.log("initialNodes", initialNodes)
  // console.log("nodes", nodes)

  const hasChanges = useMemo(() => {
    for (const node of nodes) {
      const initialNode = initialNodes.find((n) => n.id === node.id)
      if (!initialNode) return true
      if (node.data.label !== initialNode.data.label) return true
      if (node.position.x !== initialNode.position.x) return true
      if (node.position.y !== initialNode.position.y) return true
    }
    return false
  }, [nodes])

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes.map((node) => ({
          ...node,
          data: {
            label: node.data.label,
            editable: editable,
            onLabelChange,
          },
        }))}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionLineType={ConnectionLineType.Straight}
        connectionLineComponent={FloatingConnectionLine}
        connectionMode={ConnectionMode.Loose}
        connectionRadius={30}
        snapToGrid
        fitView
        fitViewOptions={fitViewOptions}
        edgesUpdatable={editable}
        nodesDraggable={editable}
        zoomOnDoubleClick={false}
      >
        <Controls showInteractive={false}>
          <ControlButton
            onClick={() => {
              setNodes((nodes) =>
                nodes.map((node) => ({
                  ...node,
                  data: {
                    label: node.data.label,
                    editable: !editable,
                    onLabelChange,
                  },
                })),
              )
              setEditable(!editable)
            }}
          >
            {editable ? <Unlock /> : <Lock />}
          </ControlButton>
        </Controls>
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={15} size={1} />
        {editable && hasChanges && (
          <Panel position="top-right">
            <Button>Save Changes</Button>
          </Panel>
        )}
      </ReactFlow>
    </div>
  )
}
