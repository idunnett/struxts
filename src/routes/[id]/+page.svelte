<script lang="ts">
  import Node from '$lib/components/Node.svelte'
  import NodeLink from '$lib/components/NodeLink.svelte'
  import { onMount } from 'svelte'
  import {
    activeEditingNode,
    activeNode,
    activeNodeLink,
    draggingNewNode,
    hoveringNode,
    linkingFromNode,
    linkingToMouse,
    defaultNodeHeights,
    defaultNodeWidths,
    nodes,
    offset,
    draggingNodeId,
    linkingFromPos,
    hLinks,
  } from '../../nodeStore'
  import type { PageServerData } from './$types'
  import {
    getXPosRelativeToScrollContainer,
    getYPosRelativeToScrollContainer,
  } from '$lib/utils/nodeUtils'
  import { activeStruxt } from '../../struxtStore'
  import type { Node as NodeType } from '$lib/server/db/schema'

  export let data: PageServerData

  $: struxtId = data.struxt.id
  $: $activeStruxt = data.struxt

  let scrollContainer: HTMLDivElement
  let dragScrolling = false

  onMount(() => {
    $nodes = data.nodes
    $hLinks = data.hLinks
    const windowWidth = window.innerWidth - 80 // (80 is width of sidebar)
    const windowHeight = window.innerHeight
    const scrollLeft =
      $offset - windowWidth / 2 + $defaultNodeWidths['node'] / 2
    const scrollTop =
      $offset - windowHeight / 2 + $defaultNodeHeights['node'] / 2

    scrollContainer.scrollTo(scrollLeft, scrollTop)
  })

  async function addNode(e: MouseEvent) {
    const { clientX, clientY } = e
    const x =
      getXPosRelativeToScrollContainer(clientX, scrollContainer) -
      $defaultNodeWidths['node'] / 2
    const y =
      getYPosRelativeToScrollContainer(clientY, scrollContainer) -
      $defaultNodeHeights['node'] / 2
    $nodes = [
      ...$nodes,
      {
        id: 0,
        x,
        y,
        title: '',
        type: 'node',
        parentId: null,
        description: '',
        struxtId,
        w: $defaultNodeWidths['node'],
        h: $defaultNodeHeights['node'],
        bgColor: '#ffffff',
        textColor: '#000000',
      },
    ]

    const res = await fetch(`/api/struxts/${struxtId}/nodes`, {
      method: 'POST',
      body: JSON.stringify({
        x,
        y,
        type: 'node',
      }),
    })
    const data = await res.json()
    const newNodeIndex = $nodes.findIndex((node) => node.id === 0)
    const newNode = $nodes[newNodeIndex]
    if (!newNode) return
    newNode.id = data.id
    $nodes[newNodeIndex] = newNode
  }

  function onMouseMove(e: MouseEvent) {
    if (!$linkingToMouse) return
    $linkingToMouse.x += e.movementX
    $linkingToMouse.y += e.movementY
  }

  async function onMouseUp() {
    if ($linkingFromNode && $linkingToMouse && $hoveringNode) {
      const toNodeIndex = $nodes.findIndex(
        (node) => node.id === $hoveringNode?.id
      )
      const toNode = $nodes[toNodeIndex]
      if (!toNode) return
      if (!$linkingFromPos) {
        toNode.parentId = $linkingFromNode.id
        $nodes[toNodeIndex] = toNode
        $linkingToMouse = null
        $linkingFromNode = null
        await fetch(`/api/struxts/${struxtId}/nodes/${toNode.id}`, {
          method: 'PUT',
          body: JSON.stringify(toNode),
        })
      } else if ($linkingFromPos === 'right') {
        $hLinks = [
          ...$hLinks,
          {
            struxtId,
            leftId: $linkingFromNode.id,
            rightId: toNode.id,
          },
        ]
        $linkingFromPos = null
        $linkingToMouse = null
        await fetch(`/api/struxts/${struxtId}/links`, {
          method: 'POST',
          body: JSON.stringify({
            leftId: $linkingFromNode.id,
            rightId: toNode.id,
          }),
        })
      }
    }
    $linkingToMouse = null
    $linkingFromNode = null
    $linkingFromPos = null
  }

  function onMouseDown() {
    if ($draggingNodeId) return
    dragScrolling = true
    scrollContainer.style.cursor = 'grabbing'
  }

  function onWindowMouseUp() {
    if (!dragScrolling) return
    dragScrolling = false
    scrollContainer.style.cursor = 'default'
  }

  function onWindowMouseMove(e: MouseEvent) {
    if (!dragScrolling) return
    scrollContainer.scrollBy(-e.movementX, -e.movementY)
  }

  function getParentNode(id: number, activeEditingNode: NodeType | null) {
    const parentNode = $nodes.find((node) => node.id === id)
    if (activeEditingNode?.id === parentNode?.id)
      return activeEditingNode ?? undefined
    return parentNode
  }

  function getNodeById(
    id: number,
    nodes: NodeType[],
    activeEditingNode: NodeType | null
  ) {
    const node = nodes.find((node) => node.id === id)
    if (activeEditingNode?.id === node?.id)
      return activeEditingNode ?? undefined
    return node
  }

  async function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      $linkingToMouse = null
      $linkingFromNode = null
    } else if (e.key === 'Backspace') {
      if (
        $activeNode &&
        confirm('Are you sure you want to delete this node?')
      ) {
        const nodeIndex = $nodes.findIndex((node) => node.id === $activeNode)
        const node = $nodes[nodeIndex]
        if (!node) return
        $nodes = $nodes.filter((node) => node.id !== $activeNode)
        $activeNode = null
        await fetch(`/api/struxts/${struxtId}/nodes/${node.id}`, {
          method: 'DELETE',
        })
      } else if ($activeNodeLink) {
        const activeLink = $activeNodeLink
        if (typeof activeLink === 'number') {
          const nodeIndex = $nodes.findIndex((node) => node.id === activeLink)
          const node = $nodes[nodeIndex]
          if (!node) return
          node.parentId = null
          $nodes[nodeIndex] = node
          await fetch(`/api/struxts/${struxtId}/nodes/${activeLink}`, {
            method: 'PATCH',
            body: JSON.stringify({ parentId: null }),
          })
        } else {
          $hLinks = $hLinks.filter(
            (link) =>
              link.leftId !== activeLink.leftId ||
              link.rightId !== activeLink.rightId
          )
          await fetch(
            `/api/struxts/${struxtId}/links/${activeLink.leftId}/${activeLink.rightId}`,
            {
              method: 'DELETE',
            }
          )
        }
      }
    }
  }
</script>

<div
  id="scroll-container"
  class="w-full h-full overflow-auto cursor-default"
  role="button"
  tabindex="0"
  on:dblclick={addNode}
  on:mouseup={onMouseUp}
  on:mousemove={onMouseMove}
  on:mousedown={onMouseDown}
  bind:this={scrollContainer}
>
  <div class="relative w-[16000px] h-[16000px] polka-dots z-0">
    {#each $nodes as node}
      <Node bind:opts={node} superValidatedForm={data.newNodeForm} {struxtId} />
      {#if node.parentId}
        <NodeLink
          from={getParentNode(node.parentId, $activeEditingNode)}
          to={$activeEditingNode?.id === node.id ? $activeEditingNode : node}
        />
      {/if}
    {/each}
    {#each $hLinks as link}
      <NodeLink
        from={getNodeById(link.leftId, $nodes, $activeEditingNode)}
        to={getNodeById(link.rightId, $nodes, $activeEditingNode)}
        horizontal
      />
    {/each}
    {#if $linkingFromNode && $linkingToMouse}
      <NodeLink bind:from={$linkingFromNode} bind:to={$linkingToMouse} />
    {/if}
    {#if $draggingNewNode}
      <Node
        bind:opts={$draggingNewNode}
        superValidatedForm={data.newNodeForm}
        {struxtId}
      />
    {/if}
  </div>
</div>

<svelte:window
  on:click={() => {
    $activeNodeLink = null
    $activeNode = null
  }}
  on:keydown={onKeyDown}
  on:mouseup={onWindowMouseUp}
  on:mousemove={onWindowMouseMove}
/>
