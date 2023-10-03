<script lang="ts">
  import { superForm } from 'sveltekit-superforms/client'
  import type { PageServerData } from './$types'

  export let data: PageServerData

  let { form, enhance } = superForm(data.loginForm)
</script>

<div class="container mx-auto flex justify-center">
  <form method="POST" class="w-96 pt-12" use:enhance>
    <h1 class="h1 font-extrabold py-2">Struxts</h1>
    <label class="label py-2">
      <span>Email</span>
      <input
        class="input"
        type="email"
        placeholder="Email"
        name="email"
        bind:value={$form.email}
      />
    </label>
    <label class="label pt-2 pb-8">
      <span>Password</span>
      <input
        class="input"
        type="password"
        placeholder="Password"
        name="password"
        bind:value={$form.password}
      />
    </label>
    <button class="btn variant-filled-primary mx-auto">Login</button>
  </form>
</div>
