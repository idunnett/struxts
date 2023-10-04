import { readable, writable } from 'svelte/store'
import type { Node } from './lib/server/db/schema'

export const nodes = writable<Node[]>([])

export const hoveringNode = writable<Node | null>(null)
export const activeEditingNode = writable<Node | null>(null)
export const linkingFromNode = writable<Node | null>(null)
export const linkingToMouse = writable<Node | null>(null)
export const draggingNodeId = writable<number | null>(null)
export const draggingNewNode = writable<Node | null>(null)
export const activeNodeLink = writable<number | null>(null)
export const activeNode = writable<number | null>(null)

export const offset = readable(8000)

type NodeWidthsOrHeights = {
  node: number
  group: number
}

export const nodeWidths = readable<{
  [key in keyof NodeWidthsOrHeights]: number
}>({
  node: 128,
  group: 256,
})

export const nodeHeights = readable<{
  [key in keyof NodeWidthsOrHeights]: number
}>({
  node: 40,
  group: 256,
})
