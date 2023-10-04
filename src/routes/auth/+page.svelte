<script lang="ts">
  import type { PageServerData } from './$types'
  import { superForm } from 'sveltekit-superforms/client'
  import { initUserSchema } from './schemas'

  export let data: PageServerData

  const { form, errors, enhance } = superForm(data.form, {
    validators: initUserSchema,
    validationMethod: 'oninput',
  })
  let confirmPassword = ''
</script>

<div class="container mx-auto flex flex-col items-center gap-4 pt-16">
  <h1 class="text-2xl font-semibold">Welcome, {$form.fullName}</h1>
  <h2 class="text-base text-surface-900">Let's get you up and running!</h2>
  <form method="POST" class="flex flex-col gap-2 w-96" use:enhance>
    <label class="label">
      <span class="text-primary-600">Email</span>
      <input
        class="input"
        type="email"
        name="email"
        disabled
        value={data.session.user?.email}
      />
    </label>
    <label class="label">
      <span class="text-primary-600">Full Name</span>
      <input
        class="input"
        type="text"
        name="fullName"
        placeholder="John Doe"
        bind:value={$form.fullName}
      />
      {#if $errors.fullName}
        <span class="text-surface-900 text-xs">{$errors.fullName[0]}</span>
      {/if}
    </label>
    <label class="label">
      <span class="text-primary-600">Password</span>
      <input
        class="input"
        type="password"
        name="password"
        bind:value={$form.password}
      />
      {#if $errors.password}
        <span class="text-surface-900 text-xs">{$errors.password[0]}</span>
      {/if}
    </label>
    <label class="label">
      <span class="text-primary-600">Confirm Password</span>
      <input
        class="input"
        type="password"
        name="confirmPassword"
        bind:value={confirmPassword}
      />
      {#if confirmPassword && $form.password !== confirmPassword}
        <span class="text-surface-900 text-xs">Passwords must match</span>
      {/if}
    </label>
    <button
      disabled={$form.password !== confirmPassword ||
        !!$errors.fullName ||
        !!$errors.password ||
        !$form.fullName.length ||
        !$form.password.length}
      class="btn variant-filled-primary mt-2">Submit</button
    >
  </form>
</div>
