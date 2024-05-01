"use client"

import {
  type MouseEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
  useTransition,
  useEffect,
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
import { type EdgeData, type NodeData } from "~/types"
import { Lock, Unlock } from "lucide-react"
import { Button } from "~/components/ui/button"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "~/components/ui/context-menu"
import { nanoid } from "nanoid"
import {
  type UpdateEdge,
  type UpdateNode,
} from "~/server/api/routers/structure"
import { api } from "~/trpc/react"
import { type api as serverApi } from "~/trpc/server"
import Spinner from "~/components/Spinner"
import { useRouter } from "next/navigation"

interface Props {
  structure: {
    id: number
    name: string
  }
  initialNodes: Awaited<ReturnType<typeof serverApi.node.getByStructureId>>
  initialEdges: Awaited<ReturnType<typeof serverApi.edge.getByStructureId>>
}

const nodeTypes = { basic: BasicNode }
const edgeTypes = { basic: BasicEdge, floating: FloatingEdge }
const defaultEdgeOptions = { type: "floating" }

export default function Structure({
  structure,
  initialNodes,
  initialEdges,
}: Props) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance>()
  const [isTransitionStarted, startTransition] = useTransition()
  const router = useRouter()
  const [editable, setEditable] = useState(true)
  const [nodesToDelete, setNodesToDelete] = useState<number[]>([])
  const [edgesToDelete, setEdgesToDelete] = useState<number[]>([])
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>(
    initialNodes.map((node) => ({
      ...node,
      id: node.id.toString(),
      data: {
        label: node.data.label ?? "",
        info: node.data.info ?? "",
        editable: false,
      },
      type: "basic",
    })),
  )
  const [edges, setEdges, onEdgesChange] = useEdgesState<EdgeData>(
    initialEdges.map((edge) => ({
      ...edge,
      id: edge.id.toString(),
      type: "floating",
      source: edge.source.toString(),
      target: edge.target.toString(),
      data: {
        ...edge.data,
        editable: false,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        strokeWidth: 1,
        height: 16,
        width: 16,
      },
    })),
  )

  const onConnect = useCallback(
    (params: Edge | Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "floating",
            markerEnd: {
              type: MarkerType.ArrowClosed,
              strokeWidth: 1,
              height: 16,
              width: 16,
              color: "hsl(var(--foreground))",
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
  const onEdgeStartLabelChange = useCallback(
    (id: string, label: string) =>
      setEdges((edges) =>
        edges.map((edge) =>
          edge.id === id
            ? {
                ...edge,
                data: { ...edge.data, startLabel: label },
              }
            : edge,
        ),
      ),
    [setEdges],
  )
  const onEdgeEndLabelChange = useCallback(
    (id: string, label: string) =>
      setEdges((edges) =>
        edges.map((edge) =>
          edge.id === id
            ? {
                ...edge,
                data: { ...edge.data, endLabel: label },
              }
            : edge,
        ),
      ),
    [setEdges],
  )
  const onInfoChange = useCallback(
    (id: string, info: string) =>
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === id ? { ...node, data: { ...node.data, info } } : node,
        ),
      ),
    [setNodes],
  )
  const onNodesDelete = useCallback(
    (nodes: Node[]) => {
      for (const node of nodes) {
        const initialNode = initialNodes.find(
          (n) => n.id.toString() === node.id,
        )
        if (!initialNode) continue
        if (nodesToDelete.includes(initialNode.id)) continue
        setNodesToDelete((nodesToDelete) =>
          nodesToDelete.concat(initialNode.id),
        )
      }
    },
    [initialNodes, nodesToDelete],
  )
  const onEdgesDelete = useCallback(
    (edges: Edge[]) => {
      for (const edge of edges) {
        const initialEdge = initialEdges.find(
          (e) => e.id.toString() === edge.id,
        )
        if (!initialEdge) continue
        if (edgesToDelete.includes(initialEdge.id)) continue
        setEdgesToDelete((edgesToDelete) =>
          edgesToDelete.concat(initialEdge.id),
        )
      }
    },
    [initialEdges, edgesToDelete],
  )

  const hasChanges = useMemo(() => {
    if (nodesToDelete.length > 0) return true
    if (edgesToDelete.length > 0) return true
    for (const node of nodes) {
      const initialNode = initialNodes.find((n) => n.id.toString() === node.id)
      if (!initialNode) return true
      if (node.data.label !== initialNode.data.label) return true
      if (node.position.x !== initialNode.position.x) return true
      if (node.position.y !== initialNode.position.y) return true
      if (node.data.info !== (initialNode.data.info ?? "")) return true
    }
    for (const edge of edges) {
      const initialEdge = initialEdges.find((e) => e.id.toString() === edge.id)
      if (!initialEdge) return true
      if (edge.source !== initialEdge.source.toString()) return true
      if (edge.target !== initialEdge.target.toString()) return true
      if (edge.data?.startLabel !== initialEdge.data.startLabel) return true
      if (edge.data?.label !== initialEdge.data.label) return true
      if (edge.data?.endLabel !== initialEdge.data.endLabel) return true
    }
    return false
  }, [
    edges,
    edgesToDelete.length,
    initialEdges,
    initialNodes,
    nodes,
    nodesToDelete.length,
  ])

  function handleAddNode(e: MouseEvent<HTMLDivElement>) {
    const position = reactFlowInstance?.screenToFlowPosition({
      x: e.clientX - 140,
      y: e.clientY - 30,
    })
    if (!position) return
    const newNode: Node<NodeData> = {
      id: `reactflow__${nanoid()}`,
      data: { label: "", info: "", editable },
      type: "basic",
      position,
    }
    setNodes((nds) => nds.concat(newNode))
  }

  const updateStructure = api.structure.update.useMutation({
    onSuccess: () => startTransition(() => router.refresh()),
  })

  const resetNodes = useCallback(() => {
    setNodes(
      initialNodes.map((node) => ({
        ...node,
        id: node.id.toString(),
        data: {
          label: node.data.label ?? "",
          info: node.data.info ?? "",
          editable: false,
        },
        type: "basic",
      })),
    )
    setNodesToDelete([])
  }, [initialNodes, setNodes])
  const resetEdges = useCallback(() => {
    setEdges(
      initialEdges.map((edge) => ({
        ...edge,
        id: edge.id.toString(),
        type: "floating",
        source: edge.source.toString(),
        target: edge.target.toString(),
        data: {
          ...edge.data,
          editable: false,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          strokeWidth: 1,
          height: 16,
          width: 16,
          color: "hsl(var(--foreground))",
        },
      })),
    )
    setEdgesToDelete([])
  }, [initialEdges, setEdges])

  useEffect(() => {
    resetNodes()
  }, [initialNodes, resetNodes])
  useEffect(() => {
    resetEdges()
  }, [initialEdges, resetEdges])

  function handleSaveChanges() {
    const nodesToUpdate: UpdateNode[] = []
    const edgesToUpdate: UpdateEdge[] = []

    for (const node of nodes) {
      const initialNode = initialNodes.find((n) => n.id.toString() === node.id)
      if (
        !initialNode ||
        node.data.label !== initialNode.data.label ||
        node.position.x !== initialNode.position.x ||
        node.position.y !== initialNode.position.y ||
        node.data.info !== (initialNode.data.info ?? "")
      ) {
        nodesToUpdate.push({
          id: node.id,
          position: node.position,
          label: node.data.label,
          info: node.data.info || null,
        })
      }
    }
    for (const edge of edges) {
      const initialEdge = initialEdges.find((e) => e.id.toString() === edge.id)
      if (
        !initialEdge ||
        edge.source !== initialEdge.source.toString() ||
        edge.target !== initialEdge.target.toString() ||
        edge.data?.startLabel !== initialEdge.data?.startLabel ||
        edge.data?.label !== initialEdge.data?.label ||
        edge.data?.endLabel !== initialEdge.data?.endLabel
      ) {
        edgesToUpdate.push({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          startLabel: edge.data?.startLabel,
          endLabel: edge.data?.endLabel,
        })
      }
    }

    updateStructure.mutate({
      structureId: structure.id,
      nodes: nodesToUpdate,
      edges: edgesToUpdate,
      nodesToDelete,
      edgesToDelete,
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
                info: node.data.info,
                editable: editable && !!reactFlowInstance,
                onLabelChange,
                onInfoChange,
              },
            }))}
            edges={edges.map((edge) => ({
              ...edge,
              data: {
                ...edge.data,
                editable: editable && !!reactFlowInstance,
                onStartLabelChange: onEdgeStartLabelChange,
                onEndLabelChange: onEdgeEndLabelChange,
              },
            }))}
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
            edgesUpdatable={editable && !!reactFlowInstance}
            nodesDraggable={editable && !!reactFlowInstance}
            nodesConnectable={editable && !!reactFlowInstance}
            selectNodesOnDrag={editable && !!reactFlowInstance}
            edgesFocusable={editable && !!reactFlowInstance}
            edgeUpdaterRadius={12.5}
            zoomOnDoubleClick={false}
            onInit={(instance) => {
              setReactFlowInstance(instance)
              setEditable(false)
            }}
            onNodesDelete={(nodes) => {
              if (editable && reactFlowInstance) onNodesDelete(nodes)
            }}
            onEdgesDelete={(edges) => {
              if (editable && reactFlowInstance) onEdgesDelete(edges)
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
                          ...node.data,
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
