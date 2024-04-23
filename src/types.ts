export interface NodeData {
  label: string
  editable: boolean
  onLabelChange?: (nodeId: string, label: string) => void
}
