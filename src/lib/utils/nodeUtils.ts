import { get } from 'svelte/store'
import { offset } from '../../nodeStore'

export function getXPosRelativeToScrollContainer(
  clientX: number,
  scrollContainer: HTMLDivElement
) {
  const clientXWithoutSidebar = clientX - 80 // (80 is width of sidebar)
  const offsetValue = get(offset)
  const x = Math.round(
    scrollContainer.scrollLeft - offsetValue + clientXWithoutSidebar
  )
  return x
}

export function getYPosRelativeToScrollContainer(
  clientY: number,
  scrollContainer: HTMLDivElement
) {
  const offsetValue = get(offset)
  const y = Math.round(scrollContainer.scrollTop - offsetValue + clientY)
  return y
}
