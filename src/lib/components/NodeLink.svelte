<script lang="ts">
  import _ from 'lodash'
  import {
    activeNodeLink,
    linkingFromPos,
    linkingToMouse,
    offset,
  } from '../../nodeStore'
  import type { Node } from '../server/db/schema'

  export let from: Node | undefined
  export let to: Node | undefined
  export let horizontal: boolean = false

  let svg: SVGSVGElement
  let path: SVGPathElement

  function adjustBezierCurve(fromNode: Node, toNode: Node): void {
    const bezierWeight: number = 0.675

    let fromNodeWidthOffset = fromNode.w / 2
    let fromNodeHeightOffset = fromNode.h
    let toNodeWidthOffset = toNode.w / 2
    let toNodeHeightOffset = 0
    let svgPaddingX = 2 // to allow for the stroke width
    let svgPaddingY = 0 // to allow for the stroke width

    if (horizontal || $linkingFromPos === 'right') {
      fromNodeWidthOffset *= 2
      fromNodeHeightOffset /= 2
      svgPaddingX = 0
      svgPaddingY = 2
      if ($linkingToMouse) {
        toNodeWidthOffset *= 2
        toNodeHeightOffset = 0
      } else {
        toNodeWidthOffset = 0
        toNodeHeightOffset = toNode.h / 2
      }
    }

    let x1 = fromNode.x + fromNodeWidthOffset + $offset
    let y1 = fromNode.y + fromNodeHeightOffset + $offset
    let x4 = toNode.x + toNodeWidthOffset + $offset
    let y4 = toNode.y + toNodeHeightOffset + $offset

    const dx = Math.abs(x4 - x1) * bezierWeight
    const dy = Math.abs(y4 - y1) * bezierWeight

    let x2 = x1 - dx
    let x3 = x4 + dx
    if (horizontal || $linkingFromPos === 'right') {
      x2 = x1 + dx
      x3 = x4 - dx
    }

    let y2 = y1 + dy
    let y3 = y4 - dy

    const minX = Math.min(x1, x4)
    const minY = Math.min(y1, y4)
    const maxX = Math.max(x1, x4)
    const maxY = Math.max(y1, y4)

    const width = maxX - minX
    const height = maxY - minY

    svg.style.left = minX - svgPaddingX + 'px'
    svg.style.top = minY - svgPaddingY + 'px'
    svg.style.width = width + svgPaddingX * 2 + 'px'
    svg.style.height = height + svgPaddingY * 2 + 'px'

    // Adjust the path coordinates by subtracting the offset
    x1 -= minX
    y1 -= minY
    x2 -= minX
    y2 -= minY
    x3 -= minX
    y3 -= minY
    x4 -= minX
    y4 -= minY

    x1 += svgPaddingX
    x4 += svgPaddingX
    y1 += svgPaddingY
    y4 += svgPaddingY

    let data: string = `M${x1} ${y1} C ${x1} ${y2} ${x4} ${y3} ${x4} ${y4}`
    if (horizontal || $linkingFromPos === 'right')
      data = `M${x1} ${y1} C ${x2} ${y1} ${x3} ${y4} ${x4} ${y4}`
    path.setAttribute('d', data)
  }

  function onPathClick() {
    if (!to || !from) return
    if (horizontal) {
      $activeNodeLink = {
        leftId: from.id,
        rightId: to.id,
      }
    } else $activeNodeLink = to.id
  }

  $: path && from && to && adjustBezierCurve(from, to)
</script>

{#if from && to}
  <svg class="absolute z-0" bind:this={svg}>
    <path
      class="fill-none cursor-pointer {$activeNodeLink === to.id ||
      _.isEqual($activeNodeLink, {
        leftId: from.id,
        rightId: to.id,
      })
        ? 'stroke-[3] stroke-secondary-400'
        : 'stroke-primary-500 stroke-2'}"
      role="button"
      tabindex="0"
      bind:this={path}
      on:click|stopPropagation={onPathClick}
      on:keypress={(e) => e.key === 'Enter' && to && ($activeNodeLink = to.id)}
    />
  </svg>
{/if}
