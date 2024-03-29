import { readable, writable } from 'svelte/store'
import type { HLink, Node } from './lib/server/db/schema'

export const nodes = writable<Node[]>([])
export const hLinks = writable<HLink[]>([])

export const presentationMode = writable<boolean>(false)

export const hoveringNode = writable<Node | null>(null)
export const activeEditingNode = writable<Node | null>(null)
export const activeEditingNodeHasChanges = writable<boolean>(false)
export const linkingFromNode = writable<Node | null>(null)
export const linkingFromPos = writable<'left' | 'right' | null>(null)
export const linkingToMouse = writable<Node | null>(null)
export const draggingNodeId = writable<number | null>(null)
export const draggingNewNode = writable<Node | null>(null)
export const activeNodeLink = writable<
  number | { leftId: number; rightId: number } | null
>(null)
export const activeNode = writable<number | null>(null)

export const offset = readable(8000)

type NodeWidthsOrHeights = {
  node: number
  group: number
}

export const defaultNodeWidths = readable<{
  [key in keyof NodeWidthsOrHeights]: number
}>({
  node: 128,
  group: 256,
})
export const defaultNodeHeights = readable<{
  [key in keyof NodeWidthsOrHeights]: number
}>({
  node: 40,
  group: 256,
})
export const minNodeWidths = readable<{
  [key in keyof NodeWidthsOrHeights]: number
}>({
  node: 40,
  group: 128,
})
export const minNodeHeights = readable<{
  [key in keyof NodeWidthsOrHeights]: number
}>({
  node: 40,
  group: 128,
})
export const defaultNodeBgColors = readable<{
  [key in keyof NodeWidthsOrHeights]: string
}>({
  node: '#ffffff',
  group: '#ebedf0',
})
