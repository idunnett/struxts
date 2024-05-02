export interface NodeData {
  label: string
  info: string
  editable: boolean
  onLabelChange?: (nodeId: string, label: string) => void
  onInfoChange?: (nodeId: string, info: string) => void
}

export interface EdgeData {
  startLabel?: string | null
  label?: string | null
  endLabel?: string | null
  editable?: boolean
  onStartLabelChange?: (edgeId: string, label: string | null) => void
  onEndLabelChange?: (edgeId: string, label: string | null) => void
  onMiddleLabelChange?: (edgeId: string, label: string | null) => void
  onDelete?: (edgeId: string) => void
}
