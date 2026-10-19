"use client"

import {
  addEdge,
  Background,
  BackgroundVariant,
  Connection,
  ConnectionLineType,
  ConnectionMode,
  DefaultEdgeOptions,
  MarkerType,
  OnSelectionChangeParams,
  Panel,
  ReactFlow,
  ReactFlowInstance,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import {
  Children,
  MouseEvent,
  ReactNode,
  use,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../../../../../../../components/ui/context-menu"
import { cn } from "../../../../../../../lib/utils"
import {
  EdgeData,
  NodeData,
  TBasicNode,
  TFloatingEdge,
} from "../../../../../../../types"
import { StructureContext } from "../../_components/StructureProvider"
import BasicNode from "./BasicNode"
import DownloadButton from "./DownloadButton"
import FloatingConnectionLine from "./FloatingConnectionLine"
import FloatingEdge from "./FloatingEdge"
import StructureControls from "./StructureControls"

interface Props {
  children?: ReactNode
}

const nodeTypes = { basic: BasicNode }
const edgeTypes = { floating: FloatingEdge }
const defaultEdgeOptions: DefaultEdgeOptions = {
  type: "floating",
  interactionWidth: 20,
}

function selectionIdsEqual(
  prev: OnSelectionChangeParams,
  next: OnSelectionChangeParams,
) {
  if (
    prev.nodes.length !== next.nodes.length ||
    prev.edges.length !== next.edges.length
  )
    return false
  for (let i = 0; i < prev.nodes.length; i++) {
    if (prev.nodes[i]?.id !== next.nodes[i]?.id) return false
  }
  for (let i = 0; i < prev.edges.length; i++) {
    if (prev.edges[i]?.id !== next.edges[i]?.id) return false
  }
  return true
}

function Structure({ children }: Props) {
  "use no memo"
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance<TBasicNode, TFloatingEdge>>()

  const {
    structure,
    nodes,
    edges,
    activeNode,
    editable,
    resizable: { isDragging, x },
    currentUserCanEdit,
    lastUsedEdgeColour,
    setLastUsedNodeColours,
    setEditable,
    onNodesChange,
    onEdgesChange,
    setNodes,
    setEdges,
    removeNodes,
    addNode,
    setSelectedNodesAndEdges,
    setLastUsedEdgeColour,
  } = use(StructureContext)

  const canEdit = editable && !!reactFlowInstance && currentUserCanEdit
  const activeNodeId = activeNode?.id ?? null

  const onNodeDataChange = useCallback(
    (id: string, newData: Partial<NodeData>) => {
      if (newData.bgColour || newData.borderColour) {
        setLastUsedNodeColours((prev) => ({
          bgColour: newData.bgColour ?? prev.bgColour,
          borderColour: newData.borderColour ?? prev.borderColour,
        }))
      }
      setNodes((current) =>
        current.map((node) =>
          node.id === id
            ? { ...node, data: { ...node.data, ...newData } }
            : node,
        ),
      )
    },
    [setNodes, setLastUsedNodeColours],
  )

  const onEdgeDataChange = useCallback(
    (id: string, newData: Partial<EdgeData>) => {
      if (newData.colour) setLastUsedEdgeColour(newData.colour)

      setEdges((current) =>
        current.map((edge) =>
          edge.id === id
            ? {
                ...edge,
                data: { ...edge.data!, ...newData },
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  strokeWidth: 1,
                  height: 16,
                  width: 16,
                  color: newData.colour ?? edge.data?.colour ?? "#000000",
                },
              }
            : edge,
        ),
      )
    },
    [setEdges, setLastUsedEdgeColour],
  )

  const onDeleteNode = useCallback(
    (id: string) => {
      removeNodes([id])
    },
    [removeNodes],
  )

  const onDeleteEdge = useCallback(
    (id: string) => {
      void reactFlowInstance?.deleteElements({ edges: [{ id }] })
    },
    [reactFlowInstance],
  )

  const onConnect = useCallback(
    (params: TFloatingEdge | Connection) => {
      if (!canEdit) return
      setEdges((eds) =>
        addEdge<TFloatingEdge>(
          {
            ...params,
            type: "floating",
            data: {
              labels: [],
              colour: lastUsedEdgeColour,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              strokeWidth: 1,
              height: 16,
              width: 16,
              color: lastUsedEdgeColour,
            },
          },
          eds,
        ),
      )
    },
    [canEdit, lastUsedEdgeColour, setEdges],
  )

  const handleNodesChange = useCallback(
    (nodeChanges: Parameters<typeof onNodesChange>[0]) => {
      if (!canEdit) return
      onNodesChange(nodeChanges)
    },
    [canEdit, onNodesChange],
  )

  const handleEdgesChange = useCallback(
    (edgeChanges: Parameters<typeof onEdgesChange>[0]) => {
      if (!canEdit) return
      onEdgesChange(edgeChanges)
    },
    [canEdit, onEdgesChange],
  )

  const handleSelectionChange = useCallback(
    (selection: OnSelectionChangeParams) => {
      if (!canEdit) return
      setSelectedNodesAndEdges((prev) =>
        selectionIdsEqual(prev, selection) ? prev : selection,
      )
    },
    [canEdit, setSelectedNodesAndEdges],
  )

  const flowNodes = useMemo(
    () =>
      nodes
        .filter((node) => !!node.id)
        .map((node) => ({
          ...node,
          data: {
            ...node.data,
            editable: canEdit,
            isActive: activeNodeId === node.id,
            onNodeDataChange,
            onDelete: onDeleteNode,
          },
        })),
    [nodes, canEdit, activeNodeId, onNodeDataChange, onDeleteNode],
  )

  const flowEdges = useMemo(
    () =>
      edges
        .filter((edge) => !!edge.id)
        .map((edge) => ({
          ...edge,
          data: {
            ...edge.data,
            labels: edge.data?.labels ?? [],
            editable: canEdit,
            colour: edge.data?.colour ?? "#000000",
            onEdgeDataChange,
            onDelete: onDeleteEdge,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            strokeWidth: 1,
            height: 16,
            width: 16,
            color: edge.data?.colour ?? "#000000",
          },
        })),
    [edges, canEdit, onEdgeDataChange, onDeleteEdge],
  )

  function handleAddNode(e: MouseEvent<HTMLDivElement>) {
    const { x, y } = reactFlowInstance?.screenToFlowPosition({
      x: e.clientX - 140,
      y: e.clientY - 30,
    }) ?? { x: 0, y: 0 }
    addNode({ x, y })
  }

  return (
    <div className={cn("flex h-full w-full", isDragging && "!select-none")}>
      <div
        className="h-full"
        ref={reactFlowWrapper}
        style={{
          width: activeNode ? `calc(100% - ${x}px)` : "100%",
        }}
      >
        <ContextMenu>
          <ContextMenuTrigger
            disabled={!canEdit}
            className="block h-full w-full"
          >
            <ReactFlow<TBasicNode, TFloatingEdge>
              onlyRenderVisibleElements={false}
              nodes={flowNodes}
              edges={flowEdges}
              onNodesChange={handleNodesChange}
              onEdgesChange={handleEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              defaultEdgeOptions={defaultEdgeOptions}
              connectionLineType={ConnectionLineType.Straight}
              connectionLineComponent={(props) => (
                <FloatingConnectionLine
                  {...props}
                  stroke={lastUsedEdgeColour}
                />
              )}
              connectionMode={ConnectionMode.Loose}
              connectionRadius={30}
              snapToGrid
              snapGrid={[12.5, 12.5]}
              fitView
              edgesReconnectable={canEdit}
              nodesDraggable={canEdit}
              nodesConnectable={canEdit}
              selectNodesOnDrag={canEdit}
              onSelectionChange={handleSelectionChange}
              edgesFocusable={canEdit}
              reconnectRadius={12.5}
              zoomOnDoubleClick={false}
              onInit={(instance) => {
                setReactFlowInstance(instance)
                setEditable(false)
              }}
              deleteKeyCode={null}
              onNodesDelete={() => {
                return
              }}
              onError={(code, msg) => {
                if (code === "002") return
                console.warn(code, msg)
              }}
            >
              {/* Single child into RF (it nests children into an array). */}
              <>
                <StructureControls
                  editable={editable}
                  currentUserCanEdit={currentUserCanEdit}
                  onToggleEdit={() => {
                    if (!currentUserCanEdit) return
                    setEditable((prev) => !prev)
                  }}
                />
                {canEdit ? (
                  <Background
                    variant={BackgroundVariant.Dots}
                    gap={12.5}
                    size={1}
                  />
                ) : null}
                <Panel position="top-right">
                  {!editable ? (
                    <DownloadButton structureName={structure.name} />
                  ) : null}
                </Panel>
              </>
            </ReactFlow>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={(e) => handleAddNode(e)}>
              + Add Node
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>
      {/* App Router may pass children as an array; toArray assigns keys. */}
      {Children.toArray(children)}
    </div>
  )
}

export default Structure
