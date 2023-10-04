<script lang="ts">
  import { ProgressRadial, getDrawerStore } from '@skeletonlabs/skeleton'
  import type { SuperValidated } from 'sveltekit-superforms'
  import { superForm } from 'sveltekit-superforms/client'
  import { activeEditingNode, nodes } from '../../../nodeStore'
  import type { newNodeSchema } from './schemas'
  import type { Node } from '$lib/server/db/schema'
  import { onMount } from 'svelte'
  import type EditorJS from '@editorjs/editorjs'

  const drawerStore = getDrawerStore()
  const superValidatedForm = $drawerStore.meta
    .superValidatedForm as SuperValidated<typeof newNodeSchema>
  let editor: EditorJS | undefined

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

  function setFormValues(node: Node) {
    $form.title = node.title ?? ''
    $form.id = node.id
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
        bind:value={$activeEditingNode.title}
      />
    </label>
    <label class="label">
      <span>Description</span>
      <div id="editor" class="input px-2" />
      <input type="hidden" name="description" value={$form.description} />
    </label>
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
