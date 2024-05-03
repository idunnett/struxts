import { type User } from "@clerk/nextjs/server"

export interface NodeData {
  label: string
  info: string
  editable: boolean
  borderColor: string
  bgColor: string
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

export interface StruxtUser {
  clerkUser: User
  role: string
}
