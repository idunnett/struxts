<script lang="ts">
  import Icon from 'svelte-icons-pack/Icon.svelte'

  export let src: any
  export let size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' = 'md'
  export let title: string | undefined = ''

  $: iconSize = (() => {
    switch (size) {
      case 'xs':
        return '0.875em'
      case 'sm':
        return '1em'
      case 'md':
        return '1.125em'
      case 'lg':
        return '1.25em'
      case 'xl':
        return '1.5em'
      case '2xl':
        return '1.875em'
      case '3xl':
        return '2em'
      default:
        return '1.125em'
    }
  })()
</script>

<Icon
  {src}
  size={iconSize}
  color="currentColor"
  className={$$props.class}
  {title}
/>
