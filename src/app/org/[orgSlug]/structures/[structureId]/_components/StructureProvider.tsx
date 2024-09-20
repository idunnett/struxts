"use client"

import {
  MarkerType,
  OnEdgesChange,
  OnNodesChange,
  OnSelectionChangeParams,
  useEdgesState,
  useNodesState,
} from "@xyflow/react"
import { useMutation } from "convex/react"
import _ from "lodash"
import { useParams } from "next/navigation"
import {
  createContext,
  DetailedHTMLProps,
  Dispatch,
  HTMLAttributes,
  ReactNode,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import Resizable from "react-resizable-layout"
import { api } from "../../../../../../../convex/_generated/api"
import { Doc } from "../../../../../../../convex/_generated/dataModel"
import { useDebounce } from "../../../../../../hooks/useDebounce"
import { usePrefetchedAuthQuery } from "../../../../../../hooks/usePrefetchedQuery"
import {
  EdgeData,
  NodeData,
  TBasicNode,
  TFloatingEdge,
} from "../../../../../../types"

interface IStructureContext {
  resizable: {
    separatorProps: Omit<
      DetailedHTMLProps<HTMLAttributes<HTMLHRElement>, HTMLHRElement>,
      "ref"
    >
    x: number
    isDragging: boolean
  }
  structure: Doc<"structures">
  nodes: TBasicNode[]
  edges: TFloatingEdge[]
  activeNode: TBasicNode | null
  editable: boolean
  currentUserCanEdit: boolean
  isSaving: boolean
  lastUsedEdgeColour: string
  lastUsedNodeColours: {
    bgColour: string
    borderColour: string
  }
  nodesInitialized: boolean
  edgesInitialized: boolean
  onNodesChange: OnNodesChange<TBasicNode>
  onEdgesChange: OnEdgesChange<TFloatingEdge>
  setNodes: Dispatch<SetStateAction<TBasicNode[]>>
  setEdges: Dispatch<SetStateAction<TFloatingEdge[]>>
  setEditable: Dispatch<SetStateAction<boolean>>
  setLastUsedEdgeColour: Dispatch<SetStateAction<string>>
  setLastUsedNodeColours: Dispatch<
    SetStateAction<{
      bgColour: string
      borderColour: string
    }>
  >
  removeNodes: (id: string[]) => void
  addNode: (data: { x: number; y: number }) => void
  setSelectedNodesAndEdges: Dispatch<SetStateAction<OnSelectionChangeParams>>
}

export const StructureContext = createContext<IStructureContext>({
  resizable: { separatorProps: {}, x: 0, isDragging: false },
  structure: {} as Doc<"structures">,
  nodes: [],
  edges: [],
  activeNode: null,
  editable: false,
  currentUserCanEdit: false,
  isSaving: false,
  lastUsedEdgeColour: "#000000",
  lastUsedNodeColours: { bgColour: "#ffffff", borderColour: "#000000" },
  nodesInitialized: false,
  edgesInitialized: false,
  onNodesChange: () => {},
  setNodes: () => {},
  onEdgesChange: () => {},
  setEdges: () => {},
  setEditable: () => {},
  removeNodes: () => {},
  addNode: () => {},
  setLastUsedEdgeColour: () => {},
  setLastUsedNodeColours: () => {},
  setSelectedNodesAndEdges: () => {},
})

interface StructureProviderProps {
  children: ReactNode
  structure: Doc<"structures">
  prefetchedNodes: typeof api.nodes.getByStructureId._returnType
  prefetchedEdges: typeof api.edges.getByStructureId._returnType
  currentOrgStructureUser: Doc<"orgStructureUsers">
}

export default function StructureProvider({
  children,
  structure,
  prefetchedNodes,
  prefetchedEdges,
  currentOrgStructureUser,
}: StructureProviderProps) {
  const dbNodes = usePrefetchedAuthQuery(
    api.nodes.getByStructureId,
    prefetchedNodes,
    { structureId: structure._id },
  )
  const dbEdges = usePrefetchedAuthQuery(
    api.edges.getByStructureId,
    prefetchedEdges,
    { structureId: structure._id },
  )

  const [edgesInitialized, setEdgesInitialized] = useState(false)
  const [nodesInitialized, setNodesInitialized] = useState(false)
  const params = useParams()
  const [nodes, setNodes, onNodesChange] = useNodesState<TBasicNode>([])
  const debouncedNodes = useDebounce(nodes, 3000)
  const [edges, setEdges, onEdgesChange] = useEdgesState<TFloatingEdge>([])
  const debouncedEdges = useDebounce(edges, 3000)
  const [editable, setEditable] = useState(true)
  const [isDeletingNodes, setIsDeletingNodes] = useState(false)
  const [isDeletingEdges, setIsDeletingEdges] = useState(false)
  const [isCreatingNode, setIsCreatingNode] = useState(false)
  const [isCreatingEdges, setIsCreatingEdges] = useState(false)
  const [lastUsedEdgeColour, setLastUsedEdgeColour] = useState("#000000")
  const [lastUsedNodeColours, setLastUsedNodeColours] = useState<{
    bgColour: string
    borderColour: string
  }>({ bgColour: "#ffffff", borderColour: "transparent" })
  const [selectedNodesAndEdges, setSelectedNodesAndEdges] =
    useState<OnSelectionChangeParams>({
      edges: [],
      nodes: [],
    })
  const activeNode = useMemo(() => {
    if (!params.nodeId) return null
    return nodes.find((node) => node.id === params.nodeId) ?? null
  }, [params, nodes])

  const currentUserCanEdit = useMemo(
    () =>
      currentOrgStructureUser.role === "Owner" ||
      currentOrgStructureUser.role === "Admin",
    [currentOrgStructureUser.role],
  )

  const createNode = useMutation(api.nodes.create)
  const updateNode = useMutation(api.nodes.update)
  const removeNode = useMutation(api.nodes.remove)

  const createEdge = useMutation(api.edges.create)
  const updateEdge = useMutation(api.edges.update)
  const removeEdge = useMutation(api.edges.remove)

  type UpdateNode = [
    string,
    Partial<NodeData> & Partial<{ x: number; y: number }>,
  ]
  type UpdateEdge = [string, Partial<EdgeData>]

  const getNodeChanges = useCallback(
    (nodes: TBasicNode[]) => {
      const nodeUpdates: UpdateNode[] = []
      for (const existingNode of dbNodes) {
        const node = nodes.find((n) => n.id === existingNode._id)
        if (!node) continue

        const changedNode: Partial<NodeData> &
          Partial<{ x: number; y: number }> = {}
        if (node.position.x !== existingNode.x) changedNode.x = node.position.x
        if (node.position.y !== existingNode.y) changedNode.y = node.position.y
        if (node.data.label !== existingNode.label)
          changedNode.label = node.data.label
        if (node.data.borderColour !== existingNode.borderColour)
          changedNode.borderColour = node.data.borderColour
        if (node.data.bgColour !== existingNode.bgColour)
          changedNode.bgColour = node.data.bgColour

        if (Object.keys(changedNode).length > 0)
          nodeUpdates.push([existingNode._id, changedNode])
      }
      return nodeUpdates
    },
    [dbNodes],
  )
  const getEdgeChanges = useCallback(
    (edges: TFloatingEdge[]) => {
      const edgeUpdates: UpdateEdge[] = []
      const edgeCreates: TFloatingEdge[] = []
      const edgeRemoves: string[] = []
      if (!edgesInitialized) return { edgeCreates, edgeUpdates, edgeRemoves }
      for (const existingEdge of dbEdges) {
        const edge = edges.find((e) => e.id === existingEdge._id)
        if (!edge?.data) {
          edgeRemoves.push(existingEdge._id)
          continue
        }
        const sourceNode = dbNodes.find((n) => n._id === existingEdge.source)
        const targetNode = dbNodes.find((n) => n._id === existingEdge.target)
        if (!sourceNode || !targetNode) {
          edgeRemoves.push(existingEdge._id)
          continue
        }

        const changedEdge: Partial<EdgeData> = {}
        if (edge.data.colour !== existingEdge.colour)
          changedEdge.colour = edge.data.colour
        if (!_.isEqual(edge.data.labels, existingEdge.labels ?? []))
          changedEdge.labels = edge.data.labels

        if (Object.keys(changedEdge).length > 0)
          edgeUpdates.push([existingEdge._id, changedEdge])
      }
      for (const edge of edges) {
        if (dbEdges.find((e) => e._id === edge.id)) continue
        edgeCreates.push(edge)
      }
      return { edgeCreates, edgeUpdates, edgeRemoves }
    },
    [dbEdges, dbNodes, edgesInitialized],
  )

  async function removeNodes(id: string[]) {
    setIsDeletingNodes(true)
    const promises = id.map((nodeId) =>
      removeNode({
        nodeId,
        structureId: structure._id,
        orgId: currentOrgStructureUser.orgId,
      }),
    )
    await Promise.all(promises).finally(() => setIsDeletingNodes(false))
    setIsDeletingNodes(false)
  }

  async function addNode({ x, y }: { x: number; y: number }) {
    setIsCreatingNode(true)
    await createNode({
      bgColour: lastUsedNodeColours.bgColour,
      borderColour: lastUsedNodeColours.borderColour,
      h: 100,
      w: 100,
      x,
      y,
      info: "",
      label: "",
      structureId: structure._id,
    })
    setIsCreatingNode(false)
  }

  const isSavingNodes = useMemo(() => {
    if (isDeletingNodes || isCreatingNode) return true
    const nodeUpdates = getNodeChanges(nodes)
    return nodeUpdates.length > 0
  }, [nodes])

  const isSavingEdges = useMemo(() => {
    if (isDeletingEdges || isCreatingEdges) return true
    const { edgeUpdates } = getEdgeChanges(edges)
    return edgeUpdates.length > 0
  }, [edges])

  const isSaving = useMemo(
    () => isSavingNodes || isSavingEdges,
    [isSavingNodes, isSavingEdges],
  )

  useEffect(() => {
    const nodeChanges = getNodeChanges(nodes)
    const newNodes: TBasicNode[] = []
    for (const dbNode of dbNodes) {
      const selected = !!selectedNodesAndEdges.nodes.find(
        (node) => node.id === dbNode._id,
      )
      const nodeChanging = nodeChanges.find(([nodeId]) => nodeId === dbNode._id)
      const changedData = nodeChanging?.[1]
      newNodes.push({
        id: dbNode._id,
        position: {
          x: changedData?.x ?? dbNode.x,
          y: changedData?.y ?? dbNode.y,
        },
        data: {
          label: changedData?.label ?? dbNode.label,
          info: changedData?.info ?? dbNode.info,
          editable,
          borderColour: changedData?.borderColour ?? dbNode.borderColour,
          bgColour: changedData?.bgColour ?? dbNode.bgColour,
          isActive: false,
          showNodeInfo: false,
          files: [],
        },
        width: 162,
        selected,
        type: "basic",
      })
    }
    setNodes(newNodes)
    setNodesInitialized(true)
  }, [dbNodes])

  useEffect(() => {
    const { edgeUpdates } = getEdgeChanges(edges)
    const newEdges: TFloatingEdge[] = []
    for (const dbEdge of dbEdges) {
      const selected = !!selectedNodesAndEdges.edges.find(
        (edge) => edge.id === dbEdge._id,
      )
      const edgeChanging = edgeUpdates.find(([edgeId]) => edgeId === dbEdge._id)
      const changedData = edgeChanging?.[1]
      newEdges.push({
        id: dbEdge._id,
        source: dbEdge.source,
        target: dbEdge.target,
        data: {
          colour: changedData?.colour ?? dbEdge.colour,
          labels: changedData?.labels ?? _.cloneDeep(dbEdge.labels),
          editable,
          isActive: false,
          showNodeInfo: false,
          files: [],
        },
        selected,
        type: "floating",
        markerEnd: {
          type: MarkerType.ArrowClosed,
          strokeWidth: 1,
          height: 16,
          width: 16,
          color: dbEdge.colour ?? "#000000",
        },
      })
    }
    setEdges(newEdges)
    setEdgesInitialized(true)
  }, [dbEdges])

  useEffect(() => {
    const nodeUpdates = getNodeChanges(nodes)
    for (const [nodeId, data] of nodeUpdates) {
      updateNode({ nodeId, data })
    }
  }, [debouncedNodes])

  useEffect(() => {
    const { edgeUpdates } = getEdgeChanges(edges)
    for (const [edgeId, data] of edgeUpdates) {
      updateEdge({ edgeId, data })
    }
  }, [debouncedEdges])

  useEffect(() => {
    if (isCreatingEdges) return
    const { edgeCreates } = getEdgeChanges(edges)
    setIsCreatingEdges(true)
    const promises = edgeCreates.map((edge) =>
      createEdge({
        colour: edge.data?.colour ?? "#000000",
        source: edge.source,
        target: edge.target,
        structureId: structure._id,
      }),
    )
    Promise.all(promises).finally(() => setIsCreatingEdges(false))
  }, [edges])

  useEffect(() => {
    if (isDeletingEdges) return
    const { edgeRemoves } = getEdgeChanges(edges)
    setIsDeletingEdges(true)
    const promises = edgeRemoves.map((edgeId) => removeEdge({ edgeId }))
    Promise.all(promises).finally(() => setIsDeletingEdges(false))
  }, [edges])

  return (
    <Resizable axis="x" reverse min={400} max={activeNode ? 800 : undefined}>
      {({ position: x, separatorProps, isDragging }) => (
        <StructureContext.Provider
          value={{
            resizable: { separatorProps: separatorProps, x, isDragging },
            structure,
            nodes,
            edges,
            activeNode,
            editable,
            currentUserCanEdit,
            isSaving,
            lastUsedEdgeColour,
            lastUsedNodeColours,
            nodesInitialized,
            edgesInitialized,
            setLastUsedEdgeColour,
            setLastUsedNodeColours,
            onNodesChange,
            onEdgesChange,
            setNodes,
            setEdges,
            setEditable,
            removeNodes,
            addNode,
            setSelectedNodesAndEdges,
          }}
        >
          {children}
        </StructureContext.Provider>
      )}
    </Resizable>
  )
}
