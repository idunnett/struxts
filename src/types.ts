import { type User } from "@clerk/nextjs/server"
import { type Edge, type Node } from "@xyflow/react"
import { type usersStructuresRoleEnum } from "./server/db/schema"

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

export interface StruxtUser {
  clerkUser: User
  role: ValuesOf<typeof usersStructuresRoleEnum.enumValues>
}
