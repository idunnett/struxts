"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type MouseEvent,
} from "react"
import ReactFlow, {
  Background,
  BackgroundVariant,
  ConnectionLineType,
  ConnectionMode,
  ControlButton,
  Controls,
  MarkerType,
  Panel,
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type DefaultEdgeOptions,
  type Edge,
  type Node,
  type ReactFlowInstance,
} from "reactflow"

import { Lock, Unlock } from "lucide-react"
import { nanoid } from "nanoid"
import { useRouter } from "next/navigation"
import "reactflow/dist/style.css"
import { toast } from "sonner"
import Spinner from "~/components/Spinner"
import { Button } from "~/components/ui/button"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "~/components/ui/context-menu"
import {
  type UpdateEdge,
  type UpdateNode,
} from "~/server/api/routers/structure"
import { api } from "~/trpc/react"
import { type api as serverApi } from "~/trpc/server"
import { type EdgeData, type NodeData } from "~/types"
import BasicNode from "./BasicNode"
import DownloadButton from "./DownloadButton"
import FloatingConnectionLine from "./FloatingConnectionLine"
import FloatingEdge from "./FloatingEdge"

interface Props {
  structure: {
    id: number
    name: string
  }
  initialNodes: Awaited<ReturnType<typeof serverApi.node.getByStructureId>>
  initialEdges: Awaited<ReturnType<typeof serverApi.edge.getByStructureId>>
  currentStructureUser: { userId: string; role: string }
}

const nodeTypes = { basic: BasicNode }
const edgeTypes = { floating: FloatingEdge }
const defaultEdgeOptions: DefaultEdgeOptions = {
  type: "floating",
  interactionWidth: 20,
}

export default function Structure({
  structure,
  initialNodes,
  initialEdges,
  currentStructureUser,
}: Props) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance>()
  const [isTransitionStarted, startTransition] = useTransition()
  const router = useRouter()
  const [editable, setEditable] = useState(true)
  const [nodesToDelete, setNodesToDelete] = useState<number[]>([])
  const [edgesToDelete, setEdgesToDelete] = useState<number[]>([])
  const [lastUsedEdgeColor, setLastUsedEdgeColor] = useState("#000000")
  const [lastUsedNodeColors, setLastUsedNodeColors] = useState<{
    bgColor: string
    borderColor: string
  }>({ bgColor: "#ffffff", borderColor: "#000000" })
  const [isNodeInfoOpen, setIsNodeInfoOpen] = useState(false)
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>(
    initialNodes.map((node) => ({
      ...node,
      id: node.id.toString(),
      data: {
        label: node.data.label ?? "",
        info: node.data.info ?? "",
        borderColor: node.data.borderColor,
        bgColor: node.data.bgColor,
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
        color: edge.data.color ?? "#000000",
      },
    })),
  )
  const onConnect = useCallback(
    (params: Edge | Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "floating",
            data: {
              color: lastUsedEdgeColor,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              strokeWidth: 1,
              height: 16,
              width: 16,
              color: lastUsedEdgeColor,
            },
          },
          eds,
        ),
      )
    },
    [lastUsedEdgeColor, setEdges],
  )
  const onEdgeDataChange = useCallback(
    (id: string, newData: Partial<EdgeData>) => {
      const edge = edges.find((edge) => edge.id === id)
      if (edge && newData.color) setLastUsedEdgeColor(newData.color)

      setEdges((edges) =>
        edges.map((edge) =>
          edge.id === id
            ? {
                ...edge,
                data: { ...edge.data!, ...newData },
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  strokeWidth: 1,
                  height: 16,
                  width: 16,
                  color: edge.data?.color ?? "#000000",
                },
              }
            : edge,
        ),
      )
    },
    [edges, setEdges],
  )
  const onNodeDataChange = useCallback(
    (id: string, newData: Partial<NodeData>) => {
      const node = nodes.find((node) => node.id === id)
      if (node && (!!newData.bgColor || !!newData.borderColor))
        setLastUsedNodeColors((prevData) => {
          if (newData.bgColor) prevData.bgColor = newData.bgColor
          if (newData.borderColor) prevData.borderColor = newData.borderColor
          return prevData
        })
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === id
            ? { ...node, data: { ...node.data, ...newData } }
            : node,
        ),
      )
    },
    [nodes, setNodes],
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
      if (node.data.borderColor !== initialNode.data.borderColor) return true
      if (node.data.bgColor !== initialNode.data.bgColor) return true
    }
    for (const edge of edges) {
      const initialEdge = initialEdges.find((e) => e.id.toString() === edge.id)
      if (!initialEdge) return true
      if (edge.source !== initialEdge.source.toString()) return true
      if (edge.target !== initialEdge.target.toString()) return true
      if (edge.data?.startLabel !== initialEdge.data.startLabel) return true
      if (edge.data?.label !== initialEdge.data.label) return true
      if (edge.data?.endLabel !== initialEdge.data.endLabel) return true
      if (edge.data?.color !== initialEdge.data.color) return true
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
    onNodesChange([
      {
        type: "add",
        item: {
          id: `reactflow__${nanoid()}`,
          data: {
            label: "",
            info: "",
            bgColor: lastUsedNodeColors.bgColor,
            borderColor: lastUsedNodeColors.borderColor,
            editable,
          },
          type: "basic",
          position: reactFlowInstance?.screenToFlowPosition({
            x: e.clientX - 140,
            y: e.clientY - 30,
          }) ?? { x: 0, y: 0 },
        },
      },
    ])
  }

  const updateStructure = api.structure.update.useMutation({
    onSettled: () => startTransition(() => router.refresh()),
    onError: (error) => toast.error(error.message),
  })

  const resetNodes = useCallback(() => {
    setNodes(
      initialNodes.map((node) => ({
        ...node,
        id: node.id.toString(),
        data: {
          label: node.data.label ?? "",
          info: node.data.info ?? "",
          borderColor: node.data.borderColor,
          bgColor: node.data.bgColor,
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
          color: edge.data.color ?? "#000000",
        },
      })),
    )
    setEdgesToDelete([])
  }, [initialEdges, setEdges])

  const currentUserCanEdit = useMemo(
    () =>
      currentStructureUser.role === "Owner" ||
      currentStructureUser.role === "Admin",
    [currentStructureUser.role],
  )

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
        node.data.info !== (initialNode.data.info ?? "") ||
        node.data.borderColor !== initialNode.data.borderColor ||
        node.data.bgColor !== initialNode.data.bgColor
      ) {
        nodesToUpdate.push({
          id: node.id,
          position: node.position,
          label: node.data.label,
          info: node.data.info || null,
          borderColor: node.data.borderColor || null,
          bgColor: node.data.bgColor || null,
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
        edge.data?.endLabel !== initialEdge.data?.endLabel ||
        edge.data?.label !== initialEdge.data?.label ||
        edge.data?.color !== initialEdge.data?.color
      ) {
        edgesToUpdate.push({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          startLabel: edge.data?.startLabel,
          endLabel: edge.data?.endLabel,
          label: edge.data?.label,
          color: edge.data?.color,
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
    <div className="h-full w-full" ref={reactFlowWrapper}>
      <ContextMenu>
        <ContextMenuTrigger disabled={isNodeInfoOpen}>
          <ReactFlow
            nodes={nodes.map((node) => ({
              ...node,
              data: {
                ...node.data,
                editable: editable && !!reactFlowInstance && currentUserCanEdit,
                onNodeDataChange,
                onDelete: (id: string) =>
                  reactFlowInstance?.deleteElements({ nodes: [{ id }] }),
                onInfoOpenChange: setIsNodeInfoOpen,
              },
            }))}
            edges={edges.map((edge) => ({
              ...edge,
              data: {
                ...edge.data,
                editable: editable && !!reactFlowInstance && currentUserCanEdit,
                onEdgeDataChange,
                onDelete: (id: string) =>
                  reactFlowInstance?.deleteElements({ edges: [{ id }] }),
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                strokeWidth: 1,
                height: 16,
                width: 16,
                color: edge.data?.color ?? "#000000",
              },
            }))}
            onNodesChange={(nodeChanges) => {
              if (editable && reactFlowInstance && currentUserCanEdit)
                onNodesChange(nodeChanges)
            }}
            onEdgesChange={(edgeChanges) => {
              if (editable && reactFlowInstance && currentUserCanEdit)
                onEdgesChange(edgeChanges)
            }}
            onConnect={(connection) => {
              if (editable && reactFlowInstance && currentUserCanEdit)
                onConnect(connection)
            }}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            connectionLineType={ConnectionLineType.Straight}
            connectionLineComponent={(props) => (
              <FloatingConnectionLine {...props} stroke={lastUsedEdgeColor} />
            )}
            connectionMode={ConnectionMode.Loose}
            connectionRadius={30}
            snapToGrid
            snapGrid={[12.5, 12.5]}
            fitView
            edgesUpdatable={
              editable && !!reactFlowInstance && currentUserCanEdit
            }
            nodesDraggable={
              editable && !!reactFlowInstance && currentUserCanEdit
            }
            nodesConnectable={
              editable && !!reactFlowInstance && currentUserCanEdit
            }
            selectNodesOnDrag={
              editable && !!reactFlowInstance && currentUserCanEdit
            }
            edgesFocusable={
              editable && !!reactFlowInstance && currentUserCanEdit
            }
            edgeUpdaterRadius={12.5}
            zoomOnDoubleClick={false}
            onInit={(instance) => {
              setReactFlowInstance(instance)
              setEditable(false)
            }}
            onNodesDelete={(nodes) => {
              if (editable && reactFlowInstance && currentUserCanEdit)
                onNodesDelete(nodes)
            }}
            onEdgesDelete={(edges) => {
              if (editable && reactFlowInstance && currentUserCanEdit)
                onEdgesDelete(edges)
            }}
          >
            {reactFlowInstance && (
              <Controls showInteractive={false}>
                <ControlButton
                  onClick={() => {
                    if (!currentUserCanEdit) return
                    setNodes((nodes) =>
                      nodes.map((node) => ({
                        ...node,
                        data: {
                          ...node.data,
                          editable: !editable,
                          onNodeDataChange,
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
            {/* <MiniMap /> */}
            {editable && reactFlowInstance && currentUserCanEdit && (
              <Background
                variant={BackgroundVariant.Dots}
                gap={12.5}
                size={1}
              />
            )}
            <Panel position="top-right">
              {editable &&
                reactFlowInstance &&
                currentUserCanEdit &&
                hasChanges && (
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={
                        updateStructure.isPending || isTransitionStarted
                      }
                      onClick={() => {
                        resetEdges()
                        resetNodes()
                      }}
                    >
                      Reset
                    </Button>
                    <Button
                      size="sm"
                      disabled={
                        updateStructure.isPending || isTransitionStarted
                      }
                      onClick={handleSaveChanges}
                    >
                      {(updateStructure.isPending || isTransitionStarted) && (
                        <Spinner className="mr-2" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                )}
              {!editable && reactFlowInstance && (
                <DownloadButton structureName={structure.name} />
              )}
            </Panel>
          </ReactFlow>
          {editable && reactFlowInstance && currentUserCanEdit && (
            <ContextMenuContent>
              <ContextMenuItem onClick={(e) => handleAddNode(e)}>
                + Add Node
              </ContextMenuItem>
            </ContextMenuContent>
          )}
        </ContextMenuTrigger>
      </ContextMenu>
    </div>
  )
}
