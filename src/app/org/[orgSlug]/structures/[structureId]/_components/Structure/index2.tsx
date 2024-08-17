"use client"

import {
  Background,
  BackgroundVariant,
  ConnectionLineType,
  ConnectionMode,
  ControlButton,
  Controls,
  DefaultEdgeOptions,
  ReactFlow,
  ReactFlowInstance,
  useNodesState,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { LucideLock, LucideUnlock } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { api } from "../../../../../../../../convex/_generated/api"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../../../../../../../components/ui/context-menu"
import { usePrefetchedAuthQuery } from "../../../../../../../hooks/usePrefetchedQuery"
import { TBasicNode, TFloatingEdge } from "../../../../../../../types"
import BasicNode from "./BasicNode"
import FloatingConnectionLine from "./FloatingConnectionLine"
import FloatingEdge from "./FloatingEdge"

interface Props {
  structureId: string
  prefetchedNodes: typeof api.nodes.getByStructureId._returnType
}

const nodeTypes = { basic: BasicNode }
const edgeTypes = { floating: FloatingEdge }
const defaultEdgeOptions: DefaultEdgeOptions = {
  type: "floating",
  interactionWidth: 20,
}

export default function Structure2({ structureId, prefetchedNodes }: Props) {
  const dbNodes = usePrefetchedAuthQuery(
    api.nodes.getByStructureId,
    prefetchedNodes,
    { structureId },
  )

  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance<TBasicNode, TFloatingEdge>>()
  const [editable, setEditable] = useState(true)
  const [nodesToDelete, setNodesToDelete] = useState<number[]>([])
  const [edgesToDelete, setEdgesToDelete] = useState<number[]>([])
  const [filesToDelete, setFilesToDelete] = useState<number[]>([])
  const [lastUsedEdgeColor, setLastUsedEdgeColor] = useState("#000000")
  const [lastUsedNodeColors, setLastUsedNodeColors] = useState<{
    bgColor: string
    borderColor: string
  }>({ bgColor: "#ffffff", borderColor: "#000000" })
  const [nodes, setNodes, onNodesChange] = useNodesState<TBasicNode>([])

  console.log(nodes)

  useEffect(() => {
    setNodes(
      dbNodes.map((node) => ({
        id: node._id,
        position: { x: node.x, y: node.y },
        data: {
          label: node.label,
          info: node.info,
          editable,
          borderColor: node.borderColour,
          bgColor: node.bgColour,
          isActive: false,
          showNodeInfo: false,
          files: [],
        },
        type: "basic",
      })),
    )
  }, [dbNodes])

  return (
    <div className="h-full w-full" ref={reactFlowWrapper}>
      <ContextMenu>
        <ContextMenuTrigger>
          <ReactFlow<TBasicNode, TFloatingEdge>
            nodes={
              nodes
              //   .map((node) => ({
              //   ...node,
              //   data: {
              //     ...node.data,
              //     editable: editable && !!reactFlowInstance && currentUserCanEdit,
              //     isActive: activeNodeId === node.id,
              //     showNodeInfo,
              //     onNodeDataChange,
              //     onDelete: (id: string) =>
              //       reactFlowInstance?.deleteElements({ nodes: [{ id }] }),
              //     onShowInfoChange: (id: string, showInfo: boolean) => {
              //       setShowNodeInfo(showInfo)
              //       if (showInfo) setActiveNodeId(id)
              //     },
              //   },
              // }))
            }
            edges={
              []
              //   edges.map((edge) => ({
              //   ...edge,
              //   data: {
              //     ...edge.data,
              //     labels: edge.data?.labels ?? [],
              //     editable: editable && !!reactFlowInstance && currentUserCanEdit,
              //     color: edge.data?.color ?? "#000000",
              //     onEdgeDataChange,
              //     onDelete: (id: string) =>
              //       reactFlowInstance?.deleteElements({ edges: [{ id }] }),
              //   },
              //   markerEnd: {
              //     type: MarkerType.ArrowClosed,
              //     strokeWidth: 1,
              //     height: 16,
              //     width: 16,
              //     color: edge.data?.color ?? "#000000",
              //   },
              // }))
            }
            // onNodeClick={(_e, node) => {
            //   setActiveNodeId(node.id)
            // }}
            // onNodesChange={(nodeChanges) => {
            //   if (editable && reactFlowInstance && currentUserCanEdit)
            //     onNodesChange(nodeChanges)
            // }}
            // onEdgesChange={(edgeChanges) => {
            //   if (editable && reactFlowInstance && currentUserCanEdit)
            //     onEdgesChange(edgeChanges)
            // }}
            // onConnect={(connection) => {
            //   if (editable && reactFlowInstance && currentUserCanEdit)
            //     onConnect(connection)
            // }}
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
            // edgesReconnectable={
            //   editable && !!reactFlowInstance && currentUserCanEdit
            // }
            // nodesDraggable={
            //   editable && !!reactFlowInstance && currentUserCanEdit
            // }
            // nodesConnectable={
            //   editable && !!reactFlowInstance && currentUserCanEdit
            // }
            // selectNodesOnDrag={
            //   editable && !!reactFlowInstance && currentUserCanEdit
            // }
            // edgesFocusable={
            //   editable && !!reactFlowInstance && currentUserCanEdit
            // }
            reconnectRadius={12.5}
            zoomOnDoubleClick={false}
            onInit={(instance) => {
              setReactFlowInstance(instance)
              setEditable(false)
            }}
            // onNodesDelete={(nodes) => {
            //   if (editable && reactFlowInstance && currentUserCanEdit)
            //     onNodesDelete(nodes)
            // }}
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
                    // if (!currentUserCanEdit) return
                    // setNodes((nodes) =>
                    //   nodes.map((node) => ({
                    //     ...node,
                    //     data: {
                    //       ...node.data,
                    //       editable: !editable,
                    //       onNodeDataChange,
                    //     },
                    //   })),
                    // )
                    setEditable(!editable)
                  }}
                >
                  {editable ? <LucideUnlock /> : <LucideLock />}
                </ControlButton>
              </Controls>
            )}
            {/* <MiniMap /> */}
            {editable && reactFlowInstance && (
              /*currentUserCanEdit &&*/ <Background
                variant={BackgroundVariant.Dots}
                gap={12.5}
                size={1}
              />
            )}
            {/* <Panel position="top-left">
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
            </Panel> */}
            {/* {activeNode && showNodeInfo && (
              <Panel
                key={activeNode.id}
                position="bottom-right"
                className="relative !m-0 flex h-full w-[500px] flex-col gap-2 bg-card p-4 pb-0 shadow-lg"
              >
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
            )} */}
          </ReactFlow>
          {editable && reactFlowInstance && (
            /*currentUserCanEdit &&*/ <ContextMenuContent>
              <ContextMenuItem /*onClick={(e) => handleAddNode(e)}*/>
                + Add Node
              </ContextMenuItem>
            </ContextMenuContent>
          )}
        </ContextMenuTrigger>
      </ContextMenu>
    </div>
  )
}
