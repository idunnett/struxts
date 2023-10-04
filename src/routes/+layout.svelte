<script lang="ts">
  import '../app.postcss'
  import {
    AppShell,
    Drawer,
    Toast,
    getToastStore,
  } from '@skeletonlabs/skeleton'
  import { initializeStores } from '@skeletonlabs/skeleton'
  import { getFlash } from 'sveltekit-flash-message'
  import NodeEditDrawer from '$lib/components/NodeEditDrawer/index.svelte'
  import Sidebar from '$lib/components/Sidebar/index.svelte'
  import type { LayoutServerData } from './$types'
  import { page } from '$app/stores'

  export let data: LayoutServerData

  initializeStores()

  const toastStore = getToastStore()
  const flash = getFlash(page)

  $: if ($flash) {
    toastStore.trigger({
      message: $flash.message,
      background:
        $flash.type === 'error'
          ? 'variant-filled-error'
          : 'variant-filled-success',
    })
  }
</script>

<svelte:head>
  <title>Struxts</title>
</svelte:head>

{#if $flash}
  <Toast position="br" rounded="rounded-lg" padding="px-3 py-2" />
{/if}
<Drawer position="right" width="w-96">
  <NodeEditDrawer />
</Drawer>
<AppShell>
  <svelte:fragment slot="sidebarLeft">
    {#if data.session}
      <Sidebar session={data.session} />
    {/if}
  </svelte:fragment>
  <slot />
</AppShell>
