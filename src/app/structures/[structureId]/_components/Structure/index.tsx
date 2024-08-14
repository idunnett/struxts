"use client"

import {
  Background,
  BackgroundVariant,
  ConnectionLineType,
  ConnectionMode,
  ControlButton,
  Controls,
  MarkerType,
  Panel,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type DefaultEdgeOptions,
  type Edge,
  type Node,
  type ReactFlowInstance,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type MouseEvent,
} from "react"

import { Lock, LucideX, Unlock } from "lucide-react"
import { nanoid } from "nanoid"
import { useRouter } from "next/navigation"
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
import {
  type EdgeData,
  type FileState,
  type NodeData,
  type TBasicNode,
  type TFloatingEdge,
} from "~/types"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../../components/ui/tabs"
import { sortFiles } from "../../_utils/fileUtils"
import BasicNode from "./BasicNode"
import Files from "./BasicNode/Files"
import TipTapEditor from "./BasicNode/TipTapEditor"
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
  initialFiles: Awaited<ReturnType<typeof serverApi.file.getByStructureId>>
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
  initialFiles,
  currentStructureUser,
}: Props) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance<TBasicNode, TFloatingEdge>>()
  const [isTransitionStarted, startTransition] = useTransition()
  const router = useRouter()
  const [editable, setEditable] = useState(true)
  const [nodesToDelete, setNodesToDelete] = useState<number[]>([])
  const [edgesToDelete, setEdgesToDelete] = useState<number[]>([])
  const [filesToDelete, setFilesToDelete] = useState<number[]>([])
  const [lastUsedEdgeColor, setLastUsedEdgeColor] = useState("#000000")
  const [lastUsedNodeColors, setLastUsedNodeColors] = useState<{
    bgColor: string
    borderColor: string
  }>({ bgColor: "#ffffff", borderColor: "#000000" })
  const [nodes, setNodes, onNodesChange] = useNodesState<TBasicNode>(
    initialNodes.map((node) => ({
      ...node,
      id: node.id.toString(),
      data: {
        label: node.data.label ?? "",
        info: node.data.info ?? "",
        borderColor: node.data.borderColor,
        bgColor: node.data.bgColor,
        editable: false,
        isActive: false,
        showNodeInfo: false,
        files: initialFiles
          .filter((file) => file.nodeId === node.id)
          .map((file) => ({
            ...file,
            id: file.id.toString(),
            parentId: file.parentId?.toString() ?? null,
            nodeId: file.nodeId.toString(),
          })),
      },
      type: "basic",
    })),
  )
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null)
  const [showNodeInfo, setShowNodeInfo] = useState(false)
  const activeNode = useMemo(
    () => nodes.find((node) => node.id === activeNodeId) ?? null,
    [activeNodeId, nodes],
  )
  const [edges, setEdges, onEdgesChange] = useEdgesState<TFloatingEdge>(
    initialEdges.map((edge) => ({
      ...edge,
      id: edge.id.toString(),
      type: "floating",
      source: edge.source.toString(),
      target: edge.target.toString(),
      data: {
        ...edge.data,
        labels: edge.data.labels.map((label) => ({
          ...label,
          id: label.id.toString(),
        })),
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
    (params: TFloatingEdge | Connection) => {
      setEdges((eds) =>
        addEdge<TFloatingEdge>(
          {
            ...params,
            type: "floating",
            data: {
              labels: [],
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
  const onFileDelete = useCallback(
    (fileId: string) => {
      const initialFile = initialFiles.find(
        (file) => file.id.toString() === fileId,
      )
      if (!initialFile) return
      if (filesToDelete.includes(initialFile.id)) return
      setFilesToDelete((filesToDelete) => filesToDelete.concat(initialFile.id))
    },
    [initialFiles, filesToDelete],
  )

  function filesHasChanges(
    initialFiles: Awaited<ReturnType<typeof serverApi.file.getByStructureId>>,
    files: FileState[],
  ) {
    for (const file of files) {
      const initialFile = initialFiles.find((f) => f.id.toString() === file.id)
      if (!initialFile) return true
      if (file.name !== initialFile.name) return true
      if (file.url !== initialFile.url) return true
      if (file.parentId !== (initialFile.parentId?.toString() ?? null))
        return true
      if (file.isFolder !== initialFile.isFolder) return true
      if (file.key !== initialFile.key) return true
    }
    return false
  }

  const hasChanges = useMemo(() => {
    if (nodesToDelete.length > 0) return true
    if (edgesToDelete.length > 0) return true
    if (filesToDelete.length > 0) return true
    for (const node of nodes) {
      const initialNode = initialNodes.find((n) => n.id.toString() === node.id)
      if (!initialNode) return true
      if (node.data.label !== initialNode.data.label) return true
      if (node.position.x !== initialNode.position.x) return true
      if (node.position.y !== initialNode.position.y) return true
      if (node.data.info !== (initialNode.data.info ?? "")) return true
      if (node.data.borderColor !== initialNode.data.borderColor) return true
      if (node.data.bgColor !== initialNode.data.bgColor) return true
      if (
        filesHasChanges(
          initialFiles.filter((file) => file.nodeId.toString() === node.id),
          node.data.files,
        )
      )
        return true
    }
    for (const edge of edges) {
      const initialEdge = initialEdges.find((e) => e.id.toString() === edge.id)
      if (!initialEdge) return true
      if (edge.source !== initialEdge.source.toString()) return true
      if (edge.target !== initialEdge.target.toString()) return true
      if (edge.data?.color !== initialEdge.data.color) return true
      if (edgeLabelsHasChanges(initialEdge.data.labels, edge.data.labels))
        for (const label of edge.data.labels) {
          const existingEdgeLabel = initialEdge.data.labels.find(
            (l) => l.id.toString() === label.id,
          )
          if (!existingEdgeLabel) return true
          if (label.label !== existingEdgeLabel.label) return true
          if (label.offset !== existingEdgeLabel.offset) return true
        }
    }
    return false
  }, [
    edges,
    edgesToDelete.length,
    initialEdges,
    initialNodes,
    initialFiles,
    filesToDelete.length,
    nodes,
    nodesToDelete.length,
  ])

  function edgeLabelsHasChanges(
    initialLabels: Awaited<
      ReturnType<typeof serverApi.edge.getByStructureId>
    >[0]["data"]["labels"],
    labels: EdgeData["labels"],
  ) {
    for (const label of labels) {
      const initialLabel = initialLabels.find(
        (l) => l.id.toString() === label.id,
      )
      if (!initialLabel) return true
      if (label.label !== initialLabel.label) return true
      if (label.offset !== initialLabel.offset) return true
    }
    return false
  }

  function handleAddNode(e: MouseEvent<HTMLDivElement>) {
    const newId = `reactflow__${nanoid()}`
    onNodesChange([
      {
        type: "add",
        item: {
          id: newId,
          data: {
            label: "",
            info: "",
            bgColor: lastUsedNodeColors.bgColor,
            borderColor: lastUsedNodeColors.borderColor,
            editable,
            files: [],
            isActive: true,
            showNodeInfo,
          },
          type: "basic",
          position: reactFlowInstance?.screenToFlowPosition({
            x: e.clientX - 140,
            y: e.clientY - 30,
          }) ?? { x: 0, y: 0 },
        },
      },
    ])
    setActiveNodeId(newId)
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
          isActive: false,
          showNodeInfo: false,
          files: sortFiles(
            initialFiles
              .filter((file) => file.nodeId === node.id)
              .map((file) => ({
                ...file,
                id: file.id.toString(),
                parentId: file.parentId?.toString() ?? null,
                nodeId: file.nodeId.toString(),
              })),
          ),
        },
        type: "basic",
      })),
    )
    setNodesToDelete([])
  }, [initialNodes, initialFiles, setNodes])
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
          labels: edge.data.labels.map((label) => ({
            ...label,
            id: label.id.toString(),
          })),
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
  useEffect(() => setFilesToDelete([]), [initialFiles])

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
        node.data.bgColor !== initialNode.data.bgColor ||
        filesHasChanges(
          initialFiles.filter((file) => file.nodeId === initialNode.id),
          node.data.files,
        )
      ) {
        nodesToUpdate.push({
          id: node.id,
          position: node.position,
          label: node.data.label,
          info: node.data.info || null,
          borderColor: node.data.borderColor || null,
          bgColor: node.data.bgColor || null,
          files: node.data.files.map((file) => ({
            id: file.id,
            key: file.key,
            name: file.name,
            url: file.url,
            parentId: file.parentId,
            structureId: structure.id,
            isFolder: file.isFolder,
          })),
        })
      }
    }
    for (const edge of edges) {
      const initialEdge = initialEdges.find((e) => e.id.toString() === edge.id)
      if (
        !initialEdge ||
        edge.source !== initialEdge.source.toString() ||
        edge.target !== initialEdge.target.toString() ||
        edge.data?.color !== initialEdge.data?.color ||
        edgeLabelsHasChanges(initialEdge.data.labels, edge.data.labels)
      ) {
        edgesToUpdate.push({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          labels: edge.data?.labels,
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
      filesToDelete,
    })
  }

  return (
    <div className="h-full w-full" ref={reactFlowWrapper}>
      <ContextMenu>
        <ContextMenuTrigger>
          <ReactFlow<TBasicNode, TFloatingEdge>
            nodes={nodes.map((node) => ({
              ...node,
              data: {
                ...node.data,
                editable: editable && !!reactFlowInstance && currentUserCanEdit,
                isActive: activeNodeId === node.id,
                showNodeInfo,
                onNodeDataChange,
                onDelete: (id: string) =>
                  reactFlowInstance?.deleteElements({ nodes: [{ id }] }),
                onShowInfoChange: (id: string, showInfo: boolean) => {
                  setShowNodeInfo(showInfo)
                  if (showInfo) setActiveNodeId(id)
                },
              },
            }))}
            edges={edges.map((edge) => ({
              ...edge,
              data: {
                ...edge.data,
                labels: edge.data?.labels ?? [],
                editable: editable && !!reactFlowInstance && currentUserCanEdit,
                color: edge.data?.color ?? "#000000",
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
            onNodeClick={(_e, node) => {
              setActiveNodeId(node.id)
            }}
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
            edgesReconnectable={
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
            reconnectRadius={12.5}
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
            onError={(code, msg) => {
              if (code === "002") return
              console.warn(code, msg)
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
            <Panel position="top-left">
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
                        setFilesToDelete([])
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
            {activeNode && showNodeInfo && (
              <Panel
                key={activeNode.id}
                position="bottom-right"
                className="relative !m-0 flex h-full w-[500px] flex-col gap-2 bg-card p-4 pb-0 shadow-lg"
              >
                {/* <div className="absolute  top-0">Hide Info</div> */}
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-lg font-semibold">
                    {activeNode.data.label}
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8"
                    onClick={() => {
                      setShowNodeInfo(false)
                      setActiveNodeId(null)
                    }}
                  >
                    <LucideX className="h-4 w-4" />
                  </Button>
                </div>
                <Tabs
                  defaultValue="info"
                  className="relative flex min-h-0 w-full grow flex-col"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="info">Info</TabsTrigger>
                    <TabsTrigger value="files">Files</TabsTrigger>
                  </TabsList>
                  <TabsContent
                    value="info"
                    className="data-state-[active]:grow !mt-0 flex min-h-0 flex-col"
                  >
                    <TipTapEditor
                      editable={editable}
                      info={activeNode.data.info}
                      onInfoUpdate={(info) => {
                        if (editable && reactFlowInstance && currentUserCanEdit)
                          onNodeDataChange?.(activeNode.id, {
                            info,
                          })
                      }}
                    />
                  </TabsContent>
                  <TabsContent
                    value="files"
                    className="data-state-[active]:grow flex min-h-0 flex-col"
                  >
                    <Files
                      files={activeNode.data.files}
                      editable={editable}
                      onFilesChange={(files) => {
                        if (editable && reactFlowInstance && currentUserCanEdit)
                          onNodeDataChange?.(activeNode.id, {
                            files,
                          })
                      }}
                      onFileDelete={onFileDelete}
                    />
                  </TabsContent>
                </Tabs>
              </Panel>
            )}
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
