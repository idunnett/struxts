"use client"

import {
  type MouseEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
  useTransition,
  useEffect,
  Suspense,
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
  type DefaultEdgeOptions,
} from "reactflow"

import "reactflow/dist/style.css"
import BasicNode from "./BasicNode"
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
import DownloadButton from "./DownloadButton"
import {
  NavigationMenu,
  NavigationMenuList,
} from "~/components/ui/navigation-menu"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import InviteMemberForm from "./InviteMemberForm"
import MembersMenuItem from "./MembersMenuItem"
import ManageMembers from "./ManageMembers"

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
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false)
  const [manageMembersDialogOpen, setManageMembersDialogOpen] = useState(false)
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
              color: "#000000",
            },
          },
          eds,
        ),
      ),
    [setEdges],
  )
  const onEdgeDataChange = useCallback(
    (id: string, newData: Partial<EdgeData>) =>
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
      ),
    [setEdges],
  )
  const onNodeDataChange = useCallback(
    (id: string, newData: Partial<NodeData>) =>
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === id
            ? { ...node, data: { ...node.data, ...newData } }
            : node,
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
            bgColor: "#ffffff",
            borderColor: "#000000",
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
    <>
      <div className="flex h-full flex-col">
        <div className="border-b px-4 py-1">
          <NavigationMenu className="flex-initial">
            <NavigationMenuList>
              <MembersMenuItem
                structureId={structure.id}
                onAddMember={() => setAddMemberDialogOpen(true)}
                onManageMembers={() => setManageMembersDialogOpen(true)}
              />
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="min-h-0 w-full grow" ref={reactFlowWrapper}>
          <ContextMenu>
            <ContextMenuTrigger>
              <ReactFlow
                nodes={nodes.map((node) => ({
                  ...node,
                  data: {
                    ...node.data,
                    editable:
                      editable && !!reactFlowInstance && currentUserCanEdit,
                    onNodeDataChange,
                    onDelete: (id: string) =>
                      reactFlowInstance?.deleteElements({ nodes: [{ id }] }),
                  },
                }))}
                edges={edges.map((edge) => ({
                  ...edge,
                  data: {
                    ...edge.data,
                    editable:
                      editable && !!reactFlowInstance && currentUserCanEdit,
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
                connectionLineComponent={FloatingConnectionLine}
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
                <MiniMap />
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
                          {(updateStructure.isPending ||
                            isTransitionStarted) && (
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
      </div>
      <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite a Member to {structure.name}</DialogTitle>
          </DialogHeader>
          <Suspense
            fallback={
              <div className="flex h-full w-full items-center justify-center">
                <Spinner />
              </div>
            }
          >
            <InviteMemberForm structureId={structure.id} />
          </Suspense>
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={manageMembersDialogOpen}
        onOpenChange={setManageMembersDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Structure Members</DialogTitle>
          </DialogHeader>
          <Suspense
            fallback={
              <div className="flex h-full w-full items-center justify-center">
                <Spinner />
              </div>
            }
          >
            <ManageMembers structureId={structure.id} />
          </Suspense>
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
