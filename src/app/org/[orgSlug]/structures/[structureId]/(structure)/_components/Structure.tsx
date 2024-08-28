"use client"

import {
  addEdge,
  Background,
  BackgroundVariant,
  Connection,
  ConnectionLineType,
  ConnectionMode,
  ControlButton,
  Controls,
  DefaultEdgeOptions,
  MarkerType,
  Panel,
  ReactFlow,
  ReactFlowInstance,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { LucideLock, LucideUnlock } from "lucide-react"
import {
  MouseEvent,
  ReactNode,
  use,
  useCallback,
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

interface Props {
  children?: ReactNode
}

const nodeTypes = { basic: BasicNode }
const edgeTypes = { floating: FloatingEdge }
const defaultEdgeOptions: DefaultEdgeOptions = {
  type: "floating",
  interactionWidth: 20,
}

export default function Structure({ children }: Props) {
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

  const onNodeDataChange = useCallback(
    (id: string, newData: Partial<NodeData>) => {
      const node = nodes.find((node) => node.id === id)
      if (node && (!!newData.bgColour || !!newData.borderColour))
        setLastUsedNodeColours((prevData) => {
          if (newData.bgColour) prevData.bgColour = newData.bgColour
          if (newData.borderColour) prevData.borderColour = newData.borderColour
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

  const onEdgeDataChange = useCallback(
    (id: string, newData: Partial<EdgeData>) => {
      const edge = edges.find((edge) => edge.id === id)
      if (edge && newData.colour) setLastUsedEdgeColour(newData.colour)

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
                  colour: edge.data?.colour ?? "#000000",
                },
              }
            : edge,
        ),
      )
    },
    [edges, setEdges],
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
    [lastUsedEdgeColour, setEdges],
  )

  function handleAddNode(e: MouseEvent<HTMLDivElement>) {
    const { x, y } = reactFlowInstance?.screenToFlowPosition({
      x: e.clientX - 140,
      y: e.clientY - 30,
    }) ?? { x: 0, y: 0 }
    addNode({
      x,
      y,
    })
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
          <ContextMenuTrigger>
            <ReactFlow<TBasicNode, TFloatingEdge>
              onlyRenderVisibleElements={false}
              nodes={nodes.map((node) => ({
                ...node,
                data: {
                  ...node.data,
                  editable:
                    editable && !!reactFlowInstance && currentUserCanEdit,
                  isActive: activeNode?.id === node.id,
                  onNodeDataChange,
                  onDelete: (id: string) => removeNodes([id]),
                },
              }))}
              edges={edges.map((edge) => ({
                ...edge,
                data: {
                  ...edge.data,
                  labels: edge.data?.labels ?? [],
                  editable:
                    editable && !!reactFlowInstance && currentUserCanEdit,
                  colour: edge.data?.colour ?? "#000000",
                  onEdgeDataChange,
                  onDelete: (id: string) =>
                    reactFlowInstance?.deleteElements({ edges: [{ id }] }),
                },
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  strokeWidth: 1,
                  height: 16,
                  width: 16,
                  color: edge.data?.colour ?? "#000000",
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
              edgesReconnectable={
                editable && !!reactFlowInstance && currentUserCanEdit
              }
              nodesDraggable={
                editable && !!reactFlowInstance && currentUserCanEdit
              }
              nodesConnectable={
                editable && !!reactFlowInstance && currentUserCanEdit
              }
              // panOnScroll
              // selectionOnDrag
              // panOnDrag={false}
              selectNodesOnDrag={
                editable && !!reactFlowInstance && currentUserCanEdit
              }
              onSelectionChange={(selection) => {
                if (editable && reactFlowInstance && currentUserCanEdit)
                  setSelectedNodesAndEdges(selection)
              }}
              edgesFocusable={
                editable && !!reactFlowInstance && currentUserCanEdit
              }
              reconnectRadius={12.5}
              zoomOnDoubleClick={false}
              onInit={(instance) => {
                setReactFlowInstance(instance)
                setEditable(false)
              }}
              deleteKeyCode={null}
              onNodesDelete={(_nodes) => {
                // if (editable && reactFlowInstance && currentUserCanEdit)
                //   removeNodes(nodes.map((node) => node.id))
                return
              }}
              // onEdgesDelete={(edges) => {
              //   if (editable && reactFlowInstance && currentUserCanEdit)
              //     onEdgesDelete(edges)
              // }}
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
                      setEditable(!editable)
                    }}
                  >
                    {editable ? <LucideUnlock /> : <LucideLock />}
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
      {children}
    </div>
  )
}
