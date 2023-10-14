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
    activeEditingNodeHasChanges,
    linkingFromPos,
    presentationMode,
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
    width: 'w-[280px] md:w-[600px]',
    meta: {
      superValidatedForm,
    },
  } satisfies DrawerSettings

  function onMouseDown() {
    if ($activeNode !== opts.id || $presentationMode) return
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

  function onLinkMouseDown(pos: 'left' | 'right' | null = null) {
    $linkingFromNode = opts
    $linkingFromPos = pos
    let x = opts.x
    let y = opts.y + opts.h
    if (pos === 'right') {
      // x += opts.w / 2
      y -= opts.h / 2
    }
    $linkingToMouse = {
      id: -1,
      x,
      y,
      title: '',
      description: '',
      type: opts.type,
      parentId: null,
      struxtId,
      w: opts.w,
      h: opts.h,
      bgColor: '#ffffff',
      textColor: '#000000',
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
    if (activeEditingNode?.id === opts.id) return activeEditingNode.y + $offset
    return opts.y + $offset
  }

  function getNodeBgColor(opts: Node, activeEditingNode: Node | null) {
    if (activeEditingNode?.id === opts.id) return activeEditingNode.bgColor
    return opts.bgColor
  }

  function getNodeTextColor(opts: Node, activeEditingNode: Node | null) {
    if (activeEditingNode?.id === opts.id) return activeEditingNode.textColor
    return opts.textColor
  }
</script>

<div
  on:dblclick|stopPropagation={() => {
    if (
      $activeEditingNodeHasChanges &&
      !confirm('Switch active nodes without saving? All changes will be lost.')
    )
      return
    $activeEditingNode = { ...opts }
    $activeEditingNodeHasChanges = false
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
  )}px; background-color: {getNodeBgColor(
    opts,
    $activeEditingNode
  )}; color: {getNodeTextColor(
    opts,
    $activeEditingNode
  )}; z-index: {opts.type === 'node' ? 10 : -10}"
  class="select-none shadow-sm {$activeNode === opts.id && !$presentationMode
    ? 'cursor-move'
    : 'cursor-pointer'} border-2 {$activeEditingNode?.id === opts.id
    ? 'border-primary-500'
    : ''} {$activeNode === opts.id
    ? 'ring-2 ring-primary-500/50 '
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
  {#if !$presentationMode}
    <div
      class="hidden group-hover:block rounded-full w-2 h-2 bg-blue-500 absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2"
      on:mousedown|stopPropagation={() => onLinkMouseDown()}
      role="button"
      tabindex="0"
    />
    <div
      class="hidden group-hover:block rounded-full w-2 h-2 bg-blue-500 absolute top-1/2 left-full -translate-x-1/2 -translate-y-1/2"
      on:mousedown|stopPropagation={() => onLinkMouseDown('right')}
      role="button"
      tabindex="0"
    />
  {/if}
</div>

<svelte:window on:mouseup={onMouseUp} on:mousemove={onMouseMove} />
