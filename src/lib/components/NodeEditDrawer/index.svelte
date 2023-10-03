<script lang="ts">
  import { ProgressRadial, getDrawerStore } from '@skeletonlabs/skeleton'
  import { activeEditingNode } from '../../../nodeStore'
  import type { SuperValidated } from 'sveltekit-superforms'
  import { superForm } from 'sveltekit-superforms/client'
  import type { newNodeSchema } from './schemas'
  import type { Node } from '$lib/server/db/schema'

  const drawerStore = getDrawerStore()
  const superValidatedForm = $drawerStore.meta
    .superValidatedForm as SuperValidated<typeof newNodeSchema>

  const { form, submitting, enhance } = superForm(superValidatedForm, {
    onResult: ({ result }) => {
      if (result.type === 'success') drawerStore.close()
    },
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
