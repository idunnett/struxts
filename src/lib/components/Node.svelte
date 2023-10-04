<script lang="ts">
  import { getDrawerStore, type DrawerSettings } from '@skeletonlabs/skeleton'
  import {
    hoveringNode,
    linkingFromNode,
    linkingToMouse,
    draggingNodeId,
    activeEditingNode,
    offset,
    activeNode,
    defaultNodeWidths,
    defaultNodeHeights,
  } from '../../nodeStore'
  import type { Node } from '../server/db/schema'
  import type { newNodeSchema } from './NodeEditDrawer/schemas'
  import type { SuperValidated } from 'sveltekit-superforms'

  export let opts: Node
  export let superValidatedForm: SuperValidated<typeof newNodeSchema>
  export let struxtId: number

  let oldX = opts.x
  let oldY = opts.y

  const drawerStore = getDrawerStore()
  $: drawerSettings = {
    id: 'new-node',
    // Provide your property overrides:
    bgDrawer: 'bg-white text-black',
    bgBackdrop: 'bg-transparent',
    width: 'w-[280px] md:w-[400px]',
    meta: {
      superValidatedForm,
    },
  } satisfies DrawerSettings

  function onMouseDown() {
    $draggingNodeId = opts.id
  }

  async function onMouseUp() {
    if ($draggingNodeId !== opts.id) return
    $draggingNodeId = null
    if (oldX === opts.x && oldY === opts.y) return
    oldX = opts.x
    oldY = opts.y
    await fetch(`/api/struxts/${struxtId}/nodes/${opts.id}`, {
      method: 'PUT',
      body: JSON.stringify(opts),
    })
  }

  function onLinkMouseDown(e: MouseEvent) {
    $linkingFromNode = opts
    $linkingToMouse = {
      id: -1,
      x: opts.x,
      y: e.clientY,
      title: '',
      description: '',
      type: 'node',
      parentId: null,
      struxtId,
      w: $defaultNodeWidths['node'],
      h: $defaultNodeHeights['node'],
    }
  }

  function onMouseMove(e: MouseEvent) {
    if ($draggingNodeId !== opts.id) return
    opts.x += e.movementX
    opts.y += e.movementY
  }

  function getNodeWidth(activeEditingNode: Node | null) {
    if (activeEditingNode?.id === opts.id) return activeEditingNode.w
    return opts.w
  }

  function getNodeHeight(activeEditingNode: Node | null) {
    if (activeEditingNode?.id === opts.id) return activeEditingNode.h
    return opts.h
  }

  function getNodeLeft(opts: Node, activeEditingNode: Node | null) {
    if (activeEditingNode?.id === opts.id) return activeEditingNode.x + $offset
    return opts.x + $offset
  }

  function getNodeTop(opts: Node, activeEditingNode: Node | null) {
    if (activeEditingNode?.id === opts.id) return activeEditingNode.y
    return opts.y
  }
</script>

<div
  on:dblclick|stopPropagation={() => {
    $activeEditingNode = { ...opts }
    drawerStore.open(drawerSettings)
  }}
  on:click|stopPropagation={() => ($activeNode = opts.id)}
  on:keydown={(e) => {
    if (e.key === 'Enter') {
      $activeEditingNode = opts
      drawerStore.open(drawerSettings)
    }
  }}
  on:mousedown={onMouseDown}
  on:mouseenter={() => ($hoveringNode = opts)}
  on:mouseleave={() => ($hoveringNode = null)}
  style="left: {getNodeLeft(opts, $activeEditingNode)}px; top: {getNodeTop(
    opts,
    $activeEditingNode
  )}px; width: {getNodeWidth($activeEditingNode)}px; height: {getNodeHeight(
    $activeEditingNode
  )}px; z-index: {opts.type === 'node' ? 10 : -10}"
  class="select-none shadow-sm cursor-move {opts.type === 'node'
    ? 'bg-white'
    : 'bg-surface-300'} border-2 {$activeNode === opts.id
    ? 'border-primary-500/50'
    : ''} absolute flex items-center rounded-md group outline-primary-500/50"
  role="button"
  tabindex="0"
>
  <span class="m-auto w-full truncate text-center text-sm px-1">
    {#if $activeEditingNode?.id === opts.id}
      {$activeEditingNode.title}
    {:else}
      {opts.title}
    {/if}
  </span>
  <!-- <input
    type="text"
    name="title"
    class="w-full outline-none px-1 text-center text-sm truncate"
    bind:value={title}
    on:blur={updateNode}
    on:keydown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
  /> -->
  <div
    class="hidden group-hover:block rounded-full w-2 h-2 bg-blue-500 absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2"
    on:mousedown|stopPropagation={onLinkMouseDown}
    role="button"
    tabindex="0"
  />
</div>

<svelte:window on:mouseup={onMouseUp} on:mousemove={onMouseMove} />
