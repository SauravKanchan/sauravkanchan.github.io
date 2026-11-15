<script>
  let { name, size = 16 } = $props();
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 16 16"
  fill="none"
  stroke="currentColor"
  stroke-width="1.5"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  {#if name === 'arrow'}
    <path d="M5 11 11 5M6 5h5v5" />
  {:else if name === 'mail'}
    <rect x="2" y="3.5" width="12" height="9" rx="1.5" />
    <path d="m2.5 4.5 5.5 4.25 5.5-4.25" />
  {:else if name === 'check'}
    <path d="m3.5 8.5 3 3 6-7" />
  {:else if name === 'doc'}
    <path d="M4 1.75h5.25L12.5 5v9.25h-8.5z" />
    <path d="M9 1.75V5.25h3.5M6.25 8.5h4M6.25 11h4" />
  {/if}
</svg>
