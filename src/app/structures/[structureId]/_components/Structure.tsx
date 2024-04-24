"use client"

import {
  type MouseEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react"
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
  type ReactFlowInstance,
} from "reactflow"

import "reactflow/dist/style.css"
import BasicNode from "./BasicNode"
import BasicEdge from "./BasicEdge"
import FloatingEdge from "./FloatingEdge"
import FloatingConnectionLine from "./FloatingConnectionLine"
import { type NodeData } from "~/types"
import { Lock, Unlock } from "lucide-react"
import { Button } from "~/components/ui/button"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "~/components/ui/context-menu"
import { nanoid } from "nanoid"
import { type UpdateNode } from "~/server/api/routers/structure"
import { api } from "~/trpc/react"
import { type api as serverApi } from "~/trpc/server"
import Spinner from "~/components/Spinner"
import { useRouter } from "next/navigation"

// const initialNodes: Node<NodeData>[] = [
//   {
//     id: "1",
//     position: { x: 0, y: 0 },
//     data: { label: "1", editable: false },
//     type: "basic",
//   },
//   {
//     id: "2",
//     position: { x: 0, y: 100 },
//     data: { label: "2", editable: false },
//     type: "basic",
//   },
//   {
//     id: "3",
//     position: { x: 200, y: 100 },
//     data: { label: "3", editable: false },
//     type: "basic",
//   },
// ]
const initialEdges: Edge[] = [
  // { id: "e1-2", source: "1", target: "2", type: "basic", label: "e1-2" },
]

interface Props {
  structure: {
    id: number
    name: string
  }
  initialNodes: Awaited<ReturnType<typeof serverApi.node.getByStructureId>>
}

const nodeTypes = { basic: BasicNode }
const edgeTypes = { basic: BasicEdge, floating: FloatingEdge }
const defaultEdgeOptions = { type: "floating" }
const fitViewOptions = { padding: 1 }

export default function Structure({ structure, initialNodes }: Props) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance>()
  const [isTransitionStarted, startTransition] = useTransition()
  const router = useRouter()
  const [editable, setEditable] = useState(true)
  const [nodes, setNodes, onNodesChange] = useNodesState(
    initialNodes.map((node) => ({
      ...node,
      id: node.id.toString(),
      data: { label: node.data.label, editable: false },
      type: "basic",
    })),
  )
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
      const initialNode = initialNodes.find((n) => n.id.toString() === node.id)
      if (!initialNode) return true
      if (node.data.label !== initialNode.data.label) return true
      if (node.position.x !== initialNode.position.x) return true
      if (node.position.y !== initialNode.position.y) return true
    }
    return false
  }, [initialNodes, nodes])

  function handleAddNode(e: MouseEvent<HTMLDivElement>) {
    const position = reactFlowInstance?.screenToFlowPosition({
      x: e.clientX,
      y: e.clientY,
    })
    if (!position) return
    const newNode: Node<NodeData> = {
      id: `__${nanoid()}`,
      data: { label: "", editable },
      type: "basic",
      position,
    }
    setNodes((nds) => nds.concat(newNode))
  }

  const updateStructure = api.structure.update.useMutation({
    onSuccess: () => {
      startTransition(() => router.refresh())
    },
  })

  function handleSaveChanges() {
    const nodesToUpdate: UpdateNode[] = []

    for (const node of nodes) {
      const initialNode = initialNodes.find((n) => n.id.toString() === node.id)
      if (
        !initialNode ||
        node.data.label !== initialNode.data.label ||
        node.position.x !== initialNode.position.x ||
        node.position.y !== initialNode.position.y
      ) {
        nodesToUpdate.push({
          id: node.id,
          position: node.position,
          label: node.data.label,
        })
      }
    }
    console.log("nodesToUpdate", nodesToUpdate)

    updateStructure.mutate({
      structureId: structure.id,
      nodes: nodesToUpdate,
    })
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="h-full w-full" ref={reactFlowWrapper}>
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
            onNodesChange={(nodeChanges) => {
              if (editable && reactFlowInstance) onNodesChange(nodeChanges)
            }}
            onEdgesChange={(edgeChanges) => {
              if (editable && reactFlowInstance) onEdgesChange(edgeChanges)
            }}
            onConnect={(connection) => {
              if (editable && reactFlowInstance) onConnect(connection)
            }}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            connectionLineType={ConnectionLineType.Straight}
            connectionLineComponent={FloatingConnectionLine}
            connectionMode={ConnectionMode.Loose}
            connectionRadius={30}
            snapToGrid
            snapGrid={[12.5, 12.5]}
            fitView
            fitViewOptions={fitViewOptions}
            edgesUpdatable={editable && !!reactFlowInstance}
            nodesDraggable={editable && !!reactFlowInstance}
            nodesFocusable={editable && !!reactFlowInstance}
            nodesConnectable={editable && !!reactFlowInstance}
            selectNodesOnDrag={editable && !!reactFlowInstance}
            edgesFocusable={editable && !!reactFlowInstance}
            elementsSelectable={editable && !!reactFlowInstance}
            zoomOnDoubleClick={false}
            onInit={(instance) => {
              setReactFlowInstance(instance)
              setEditable(false)
            }}
          >
            {reactFlowInstance && (
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
            )}
            <MiniMap />
            {editable && reactFlowInstance && (
              <Background
                variant={BackgroundVariant.Dots}
                gap={12.5}
                size={1}
              />
            )}
            {editable && reactFlowInstance && hasChanges && (
              <Panel position="top-right">
                <Button
                  disabled={updateStructure.isPending || isTransitionStarted}
                  onClick={handleSaveChanges}
                >
                  {(updateStructure.isPending || isTransitionStarted) && (
                    <Spinner className="mr-2" />
                  )}
                  Save Changes
                </Button>
              </Panel>
            )}
          </ReactFlow>
        </div>
        {editable && reactFlowInstance && (
          <ContextMenuContent>
            <ContextMenuItem onClick={(e) => handleAddNode(e)}>
              + Add Node
            </ContextMenuItem>
          </ContextMenuContent>
        )}
      </ContextMenuTrigger>
    </ContextMenu>
  )
}
