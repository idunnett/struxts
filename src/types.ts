export interface NodeData {
  label: string
  editable: boolean
  onLabelChange?: (nodeId: string, label: string) => void
}

export interface EdgeData {
  startLabel?: string | null
  label?: string | null
  endLabel?: string | null
  editable?: boolean
  onStartLabelChange?: (edgeId: string, label: string) => void
  onEndLabelChange?: (edgeId: string, label: string) => void
}
