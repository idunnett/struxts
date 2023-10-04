<script lang="ts">
  import {
    activeNodeLink,
    nodeHeights,
    nodeWidths,
    offset,
  } from '../../nodeStore'
  import type { Node } from '../server/db/schema'

  export let from: Node | undefined
  export let to: Node

  let svg: SVGSVGElement
  let path: SVGPathElement

  function adjustBezierCurve(fromNode: Node, toNode: Node): void {
    const bezierWeight: number = 0.675

    const fromNodeWidthHalf = $nodeWidths[fromNode.type] / 2
    const toNodeWidthHalf = $nodeWidths[toNode.type] / 2
    const fromNodeHeight = $nodeHeights[fromNode.type]

    let x1: number = fromNode.x + fromNodeWidthHalf + $offset
    let y1: number = fromNode.y + fromNodeHeight
    let x4: number = toNode.x + toNodeWidthHalf + $offset
    let y4: number = toNode.y
    const dy: number = Math.abs(y4 - y1) * bezierWeight

    let y2: number = y1 + dy
    let y3: number = y4 - dy

    const minX: number = Math.min(x1, x4)
    const minY: number = Math.min(y1, y4)
    const maxX: number = Math.max(x1, x4)
    const maxY: number = Math.max(y1, y4)

    const width: number = maxX - minX
    const height: number = maxY - minY

    const svgPaddingX = 2 // to allow for the stroke width

    svg.style.left = minX - svgPaddingX + 'px'
    svg.style.top = minY + 'px'
    svg.style.width = width + svgPaddingX * 2 + 'px'
    svg.style.height = height + 'px'

    // Adjust the path coordinates by subtracting the offset
    x1 -= minX
    x4 -= minX
    y1 -= minY
    y2 -= minY
    y3 -= minY
    y4 -= minY

    x1 += svgPaddingX
    x4 += svgPaddingX

    const data: string = `M${x1} ${y1} C ${x1} ${y2} ${x4} ${y3} ${x4} ${y4}`
    path.setAttribute('d', data)
  }

  $: path && from && adjustBezierCurve(from, to)
</script>

{#if from}
  <svg class="absolute z-0" bind:this={svg}>
    <path
      class="fill-none cursor-pointer {$activeNodeLink === to.id
        ? 'stroke-[3] stroke-secondary-400'
        : 'stroke-primary-500 stroke-2'}"
      role="button"
      tabindex="0"
      bind:this={path}
      on:click|stopPropagation={() => to && ($activeNodeLink = to.id)}
      on:keypress={(e) => e.key === 'Enter' && to && ($activeNodeLink = to.id)}
    />
  </svg>
{/if}
