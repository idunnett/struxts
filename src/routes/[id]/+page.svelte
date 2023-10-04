<script lang="ts">
  import Node from '$lib/components/Node.svelte'
  import NodeLink from '$lib/components/NodeLink.svelte'
  import { onMount } from 'svelte'
  import {
    activeNode,
    activeNodeLink,
    draggingNewNode,
    hoveringNode,
    linkingFromNode,
    linkingToMouse,
    nodes,
    offset,
  } from '../../nodeStore'
  import type { PageServerData } from './$types'
  import { getXPosRelativeToScrollContainer } from '$lib/utils/nodeUtils'

  export let data: PageServerData

  $: struxtId = data.struxtId

  let scrollContainer: HTMLDivElement

  onMount(() => {
    $nodes = data.nodes
    const windowWidth = window.innerWidth - 80 // (80 is width of sidebar)
    const scrollLeft = $offset - windowWidth / 2 + 64 // (64 is half of node width)
    scrollContainer.scrollTo(scrollLeft, 0)
  })

  async function addNode(e: MouseEvent) {
    const { clientX, clientY } = e
    const x = getXPosRelativeToScrollContainer(clientX, scrollContainer)
    $nodes = [
      ...$nodes,
      {
        id: 0,
        x,
        y: clientY - 20,
        title: '',
        type: 'node',
        parentId: null,
        description: '',
        struxtId,
      },
    ]

    const res = await fetch(`/api/struxts/${struxtId}/nodes`, {
      method: 'POST',
      body: JSON.stringify({
        x,
        y: clientY - 20,
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
      toNode.parentId = $linkingFromNode.id
      $nodes[toNodeIndex] = toNode
      $linkingToMouse = null
      $linkingFromNode = null
      await fetch(`/api/struxts/${struxtId}/nodes/${toNode.id}`, {
        method: 'PUT',
        body: JSON.stringify(toNode),
      })
    }
    $linkingToMouse = null
    $linkingFromNode = null
  }

  function getParentNode(id: number) {
    return $nodes.find((node) => node.id === id)
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
        const nodeIndex = $nodes.findIndex(
          (node) => node.id === $activeNodeLink
        )
        const node = $nodes[nodeIndex]
        if (!node) return
        node.parentId = null
        $nodes[nodeIndex] = node

        await fetch(`/api/struxts/${struxtId}/nodes/${$activeNodeLink}`, {
          method: 'PATCH',
          body: JSON.stringify({ parentId: null }),
        })
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
  bind:this={scrollContainer}
>
  <div class="relative w-[16000px] h-full polka-dots z-0">
    {#each $nodes as node}
      <Node bind:opts={node} superValidatedForm={data.newNodeForm} {struxtId} />
      {#if node.parentId}
        <NodeLink from={getParentNode(node.parentId)} to={node} />
      {/if}
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
/>
