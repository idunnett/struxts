<script lang="ts">
  import CgArrowsH from 'svelte-icons-pack/cg/CgArrowsH'
  import { ProgressRadial, getDrawerStore } from '@skeletonlabs/skeleton'
  import type { SuperValidated } from 'sveltekit-superforms'
  import { superForm } from 'sveltekit-superforms/client'
  import {
    activeEditingNode,
    minNodeHeights,
    minNodeWidths,
    nodes,
  } from '../../../nodeStore'
  import type { newNodeSchema } from './schemas'
  import type { Node } from '$lib/server/db/schema'
  import { onMount } from 'svelte'
  import type EditorJS from '@editorjs/editorjs'
  import Icon from '../Icon.svelte'

  const drawerStore = getDrawerStore()
  const superValidatedForm = $drawerStore.meta
    .superValidatedForm as SuperValidated<typeof newNodeSchema>
  let editor: EditorJS | undefined
  let resizing: 'x' | 'y' | 'w' | 'h' | null = null

  const { form, submitting, enhance } = superForm(superValidatedForm, {
    onSubmit: () => {
      const nodeIndex = $nodes.findIndex((n) => n.id === $form.id)
      const node = $nodes[nodeIndex]
      if (!node) return
      node.title = $form.title
      node.description = $form.description
      $nodes[nodeIndex] = node
    },
    onResult: ({ result }) => {
      if (result.type === 'success') drawerStore.close()
    },
  })

  onMount(async () => {
    const EditorJS = (await import('@editorjs/editorjs')).default
    // @ts-ignore
    const Header = (await import('@editorjs/header')).default
    // @ts-ignore
    const List = (await import('@editorjs/list')).default
    const description = $activeEditingNode?.description ?? ''
    const blocks = description ? JSON.parse(description) : []
    $form.description = description
    editor = new EditorJS({
      holder: 'editor',
      tools: {
        Header: {
          class: Header,
          inlineToolbar: true,
        },
        List: {
          class: List,
          inlineToolbar: true,
        },
      },
      placeholder: 'Start typing...',
      onChange: async (e) => {
        const blocks = (await e.saver.save()).blocks
        $form.description = JSON.stringify(blocks)
      },
    })
    await editor.isReady
    editor.blocks.insertMany(blocks)
  })

  function onMouseMove(e: MouseEvent) {
    if (!resizing || !$activeEditingNode) return
    if (resizing === 'x') $activeEditingNode.x += e.movementX
    else if (resizing === 'y') $activeEditingNode.y += e.movementX
    else if (resizing === 'w') {
      const newWidth = $activeEditingNode.w + e.movementX
      if (e.movementX < 0 && newWidth < $minNodeWidths[$activeEditingNode.type])
        return
      $activeEditingNode.w = newWidth
    } else if (resizing === 'h') {
      const newHeight = $activeEditingNode.h + e.movementX
      if (
        e.movementX < 0 &&
        newHeight < $minNodeHeights[$activeEditingNode.type]
      )
        return
      $activeEditingNode.h = newHeight
    }
  }

  function onMouseUp() {
    resizing = null
  }

  function onAdjustMouseDown(dimension: 'x' | 'y' | 'w' | 'h') {
    resizing = dimension
  }

  function setFormValues(node: Node) {
    $form.title = node.title ?? ''
    $form.id = node.id
    $form.description = node.description ?? ''
    $form.x = node.x
    $form.y = node.y
  }
  $: $activeEditingNode && setFormValues($activeEditingNode)
</script>

{#if $activeEditingNode}
  <form
    method="post"
    action="?/update"
    class="flex flex-col p-4 gap-4"
    use:enhance
  >
    <input type="hidden" name="id" value={$activeEditingNode.id} />
    <label class="label">
      <span>Title</span>
      <input
        class="input"
        type="text"
        placeholder="Title"
        name="title"
        disabled={$submitting || $activeEditingNode.type === 'group'}
        bind:value={$activeEditingNode.title}
      />
    </label>
    <label class="label">
      <span>Description</span>
      <div id="editor" class="input px-2" />
      <input
        type="hidden"
        name="description"
        value={$form.description}
        disabled={$submitting || $activeEditingNode.type === 'group'}
      />
    </label>
    <div class="flex gap-4 items-center text-sm">
      <label class="label flex items-center gap-1">
        <button
          type="button"
          class="w-10 h-8 cursor-ew-resize variant-soft-surface rounded-md text-surface-900 flex flex-col items-center justify-center"
          on:mousedown={() => onAdjustMouseDown('x')}
        >
          <span class="h-4 pt-0.5">X</span>
          <Icon src={CgArrowsH} class="text-surface-600" size="xs" />
        </button>
        <input
          class="input"
          type="number"
          name="x"
          disabled={$submitting}
          bind:value={$activeEditingNode.x}
        />
      </label>
      <label class="label flex items-center gap-1">
        <button
          type="button"
          class="w-10 h-8 cursor-ew-resize variant-soft-surface rounded-md text-surface-900 flex flex-col items-center justify-center"
          on:mousedown={() => onAdjustMouseDown('y')}
        >
          <span class="h-4 pt-0.5">Y</span>
          <Icon src={CgArrowsH} class="text-surface-600" size="xs" />
        </button>
        <input
          class="input"
          type="number"
          name="y"
          disabled={$submitting}
          bind:value={$activeEditingNode.y}
        />
      </label>
    </div>
    <div class="flex gap-4 items-center text-sm">
      <label class="label flex items-center gap-1">
        <button
          type="button"
          class="w-10 h-8 cursor-ew-resize variant-soft-surface rounded-md text-surface-900 flex flex-col items-center justify-center"
          on:mousedown={() => onAdjustMouseDown('w')}
        >
          <span class="h-4 pt-0.5">W</span>
          <Icon src={CgArrowsH} class="text-surface-600" size="xs" />
        </button>
        <input
          class="input"
          type="number"
          name="w"
          min={$minNodeWidths[$activeEditingNode.type]}
          disabled={$submitting}
          bind:value={$activeEditingNode.w}
        />
      </label>
      <label class="label flex items-center gap-1">
        <button
          type="button"
          class="w-10 h-8 cursor-ew-resize variant-soft-surface rounded-md text-surface-900 flex flex-col items-center justify-center"
          on:mousedown={() => onAdjustMouseDown('h')}
        >
          <span class="h-4 pt-0.5">H</span>
          <Icon src={CgArrowsH} class="text-surface-600" size="xs" />
        </button>
        <input
          class="input"
          type="number"
          name="h"
          min={$minNodeHeights[$activeEditingNode.type]}
          disabled={$submitting}
          bind:value={$activeEditingNode.h}
        />
      </label>
    </div>
    <button
      type="submit"
      class="btn variant-filled-primary"
      disabled={$submitting}
    >
      {#if $submitting}
        <ProgressRadial
          width="w-6"
          meter="stroke-white"
          track="stroke-white/30"
          stroke={75}
        />
      {:else}
        Save
      {/if}
    </button>
  </form>
{/if}

<svelte:window
  on:mousemove|stopPropagation={onMouseMove}
  on:mouseup|stopPropagation={onMouseUp}
/>
