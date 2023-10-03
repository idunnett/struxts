<script lang="ts">
  import '../app.postcss'
  import NodeEditDrawer from '$lib/components/NodeEditDrawer/index.svelte'
  import { AppShell, Drawer } from '@skeletonlabs/skeleton'
  import { initializeStores } from '@skeletonlabs/skeleton'
  import Sidebar from '$lib/components/Sidebar/index.svelte'
  import type { LayoutServerData } from './$types'

  export let data: LayoutServerData

  initializeStores()
</script>

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
