<script lang="ts">
  import { superForm } from 'sveltekit-superforms/client'
  import type { PageServerData } from './$types'

  export let data: PageServerData

  const { form, errors, enhance } = superForm(data.newStruxtForm)
</script>

<div class="container mx-auto flex flex-col items-center gap-4 pt-16">
  <h1 class="text-2xl font-semibold">Create new Struxt</h1>
  <form method="POST" class="flex flex-col gap-2 w-96" use:enhance>
    <label class="label">
      <span class="text-primary-600">Full Name</span>
      <input
        class="input"
        type="text"
        name="title"
        placeholder="New Struxt Name"
        bind:value={$form.title}
      />
      {#if $errors.title}
        <span class="text-surface-900 text-xs">{$errors.title[0]}</span>
      {/if}
    </label>
    <button
      disabled={!!$errors.title || !$form.title.length}
      class="btn variant-filled-primary mt-2">Submit</button
    >
  </form>
</div>
