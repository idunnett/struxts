export interface NodeData {
  id: number
  x: number
  y: number
  title: string
}

export interface NodeLinkData {
  from: NodeData
  to?: NodeData
}
