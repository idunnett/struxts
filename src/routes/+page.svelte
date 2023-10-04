<script lang="ts">
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import { onMount } from 'svelte'

  onMount(async () => {
    if ($page.url.hash) {
      const hashParamsStr = $page.url.hash.slice(1)
      const hashParams = new URLSearchParams(hashParamsStr)
      if (
        hashParams.has('access_token') &&
        hashParams.has('token_type') &&
        hashParams.has('expires_in') &&
        hashParams.has('refresh_token') &&
        hashParams.has('type')
      ) {
        const accessToken = hashParams.get('access_token')
        const tokenType = hashParams.get('token_type')
        await goto('/auth?' + hashParamsStr, { replaceState: true })
      }
    }
  })
</script>

<div class="container mx-auto flex justify-center items-center h-full">
  <div class="flex flex-col items-center">
    <span class="text-xl font-normal mb-3">Welcome to</span>
    <h3 class="h2">
      <span class="text-primary-500">Struxts</span>
    </h3>
  </div>
</div>
