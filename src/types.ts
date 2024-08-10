import { type User } from "@clerk/nextjs/server"
import { type usersStructuresRoleEnum } from "./server/db/schema"

export interface NodeData {
  label: string
  info: string
  editable: boolean
  borderColor: string
  bgColor: string
  files: FileState[]
  isActive: boolean
  onDelete?: (nodeId: string) => void
  onNodeDataChange?: (nodeId: string, data: Partial<NodeData>) => void
}

export interface EdgeData {
  startLabel?: string | null
  label?: string | null
  endLabel?: string | null
  color: string
  editable?: boolean
  onEdgeDataChange?: (edgeId: string, data: Partial<EdgeData>) => void
  onDelete?: (edgeId: string) => void
}

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
