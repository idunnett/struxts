import { type Edge, type Node } from "@xyflow/react"
import { Doc } from "../convex/_generated/dataModel"

export interface NodeData extends Record<string, unknown> {
  label: string
  info: string
  editable: boolean
  borderColour: string
  bgColour: string
  files: FileState[]
  isActive: boolean
  onDelete?: (nodeId: string) => void
  onNodeDataChange?: (nodeId: string, data: Partial<NodeData>) => void
}

export type TBasicNode = Node<NodeData, "basic">

export interface EdgeData extends Record<string, unknown> {
  labels: { label: string; offset: number }[]
  colour: string
  editable?: boolean
  onEdgeDataChange?: (edgeId: string, data: Partial<EdgeData>) => void
  onDelete?: (edgeId: string) => void
}

export type TFloatingEdge = Edge<EdgeData, "floating">

export interface FileState {
  id: string
  key: string | null
  name: string
  url: string | null
  parentId: string | null
  isFolder: boolean
}

export type ValuesOf<T extends unknown[]> = T[number]

export interface ClerkUserData {
  imageUrl: string
  primaryEmailAddress: string | null
  fullName: string | null
  firstName: string | null
  lastName: string | null
  userId: string
}

export type ClerkOrgStructureUser = Doc<"orgStructureUsers"> & ClerkUserData
