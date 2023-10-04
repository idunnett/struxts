<script lang="ts">
  import type { AuthSession } from '@supabase/supabase-js'
  import RiUserUser3Line from 'svelte-icons-pack/ri/RiUserUser3Line'
  import TiArrowRight from 'svelte-icons-pack/ti/TiArrowRight'
  import RiSystemLogoutBoxLine from 'svelte-icons-pack/ri/RiSystemLogoutBoxLine'
  import Icon from '../Icon.svelte'
  import { AppRail, Avatar } from '@skeletonlabs/skeleton'
  import { getInitials } from '$lib/utils/avatarUtils'
  import { getXPosRelativeToScrollContainer } from '$lib/utils/nodeUtils'
  import {
    draggingNewNode,
    draggingNodeId,
    defaultNodeHeights,
    defaultNodeWidths,
    nodes,
  } from '../../../nodeStore'
  import { goto, invalidateAll } from '$app/navigation'
  import { page } from '$app/stores'

  export let session: AuthSession

  let showUserMenu = false

  $: struxtId = $page.params.id ? parseInt($page.params.id) : undefined

  async function handleSignOut() {
    await fetch('/api/auth/logout', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    await invalidateAll()
    await goto('/auth/login')
  }
  // async function getProfile(session: AuthSession) {
  //   const { user } = session

  //   const { data, error } = await supabase
  //     .from('profiles')
  //     .select('full_name, avatar_url, user_roles ( role )')
  //     .eq('id', user.id)
  //     .single()

  //   if (error) throw error

  //   if (data.avatar_url) data.avatar_url = await downloadImage(data.avatar_url)
  //   // @ts-ignore
  //   if (data.user_roles.role === 'Admin') $isAdmin = true
  //   return data
  // }

  let userMenuDiv: HTMLDivElement
  let userMenuBtn: HTMLButtonElement

  $: {
    if (showUserMenu && userMenuBtn && userMenuDiv) {
      const { x, y, width } = userMenuBtn.getBoundingClientRect()
      userMenuDiv.style.bottom = `0px`
      userMenuDiv.style.left = `${x + width}px`
    }
  }

  async function onMouseUp() {
    if (!$draggingNewNode || !struxtId) return
    const draggingNewNodeCopy = $draggingNewNode
    $draggingNewNode = null
    $nodes = [
      ...$nodes,
      {
        id: 0,
        x: draggingNewNodeCopy.x,
        y: draggingNewNodeCopy.y,
        w: draggingNewNodeCopy.w,
        h: draggingNewNodeCopy.h,
        title: '',
        type: draggingNewNodeCopy.type,
        parentId: null,
        description: '',
        struxtId,
      },
    ]
    const res = await fetch(`/api/struxts/${struxtId}/nodes`, {
      method: 'POST',
      body: JSON.stringify({
        x: draggingNewNodeCopy.x,
        y: draggingNewNodeCopy.y,
        type: draggingNewNodeCopy.type,
      }),
    })
    const data = await res.json()
    const newNodeIndex = $nodes.findIndex((node) => node.id === 0)
    const newNode = $nodes[newNodeIndex]
    if (!newNode) return
    newNode.id = data.id
    $nodes[newNodeIndex] = newNode
  }

  function onNewNodeMouseDown(e: MouseEvent, type: 'node' | 'group' = 'node') {
    if (!struxtId) return
    const { clientX, clientY } = e
    const scrollContainer = document.getElementById(
      'scroll-container'
    ) as HTMLDivElement
    const x = getXPosRelativeToScrollContainer(clientX, scrollContainer)
    $draggingNewNode = {
      id: -1,
      x,
      y: clientY - 20,
      w: $defaultNodeWidths[type],
      h: $defaultNodeHeights[type],
      title: '',
      type,
      parentId: null,
      description: '',
      struxtId,
    }
    $draggingNodeId = -1
  }
</script>

<div
  class="fixed z-10 card ml-5 p-2 rounded-lg w-56 flex flex-col gap-1 my-4 shadow-lg {showUserMenu
    ? 'block'
    : 'hidden'}"
  bind:this={userMenuDiv}
>
  <!-- {#if $isAdmin}
    <button
      class="btn text-surface-900 hover:text-primary-500 hover:variant-filled-surface flex items-center justify-between text-sm group"
      on:click={() => ($activeView = 'admin')}
    >
      <div class="flex items-center gap-2">
        <Icon src={BsShieldLock} class="group-hover:text-black" />
        Admin
      </div>
      <Icon
        src={TiArrowRight}
        size="xl"
        class="group-hover:translate-x-1 transition-transform"
      />
    </button>
  {/if} -->
  <button
    class="btn text-surface-900 hover:text-primary-500 hover:variant-filled-surface flex items-center justify-between text-sm group"
  >
    <div class="flex items-center gap-2">
      <Icon src={RiUserUser3Line} class="group-hover:text-black" />
      Profile
    </div>
    <Icon
      src={TiArrowRight}
      size="xl"
      class="group-hover:translate-x-1 transition-transform"
    />
  </button>
  <button
    class="btn text-surface-900 hover:text-primary-500 hover:variant-filled-surface flex items-center gap-2 justify-between text-sm group"
    on:click={handleSignOut}
  >
    <div class="flex items-center gap-2">
      <Icon src={RiSystemLogoutBoxLine} class="group-hover:text-black" />
      Sign Out
    </div>
  </button>
</div>
<AppRail>
  <h1 slot="lead" class="text-center pt-2 pb-4 font-bold h6 text-primary-500">
    Struxts
  </h1>
  <!-- <AppRailAnchor href="/" selected={$page.url.pathname === '/'}>
      (icon)
    </AppRailAnchor>
    <AppRailAnchor href="/about" selected={$page.url.pathname === '/about'}>
      (icon)
    </AppRailAnchor> -->
  {#if session}
    <div class="w-full flex flex-col items-center gap-1 py-2">
      <div
        class="select-none cursor-move bg-white border-2 w-14 m-auto h-7 flex items-center rounded-md"
        role="button"
        tabindex="0"
        on:mousedown={onNewNodeMouseDown}
      />
      <span class="text-xs text-surface-900 select-none">Node</span>
    </div>
    <div class="w-full flex flex-col items-center gap-1 py-2">
      <div
        class="select-none cursor-move bg-surface-300 border-2 w-14 m-auto h-14 flex items-center rounded-md"
        role="button"
        tabindex="0"
        on:mousedown={(e) => onNewNodeMouseDown(e, 'group')}
      />
      <span class="text-xs text-surface-900 select-none">Group</span>
    </div>
  {/if}
  <div slot="trail" class="flex items-center justify-center pb-2">
    <button
      bind:this={userMenuBtn}
      on:click={() => (showUserMenu = !showUserMenu)}
      class="relative btn flex items-center justify-start px-2 gap-1 text-surface-900 hover:text-primary-500 hover:bg-surface-400/50 w-full min-w-0"
    >
      <Avatar
        initials={getInitials(session?.user.email ?? '')}
        width="w-10 shrink-0"
        background="bg-primary-400"
      />
    </button>
  </div>
</AppRail>

<svelte:window
  on:click|capture={() => (showUserMenu = false)}
  on:mouseup={onMouseUp}
/>
