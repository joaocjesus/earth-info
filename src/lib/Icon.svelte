<script>
  let { name, size = 20, strokeWidth = 1.6 } = $props();
  const paths = {
    globe: ['M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z', 'M3 12h18', 'M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z'],
    chevron: ['m14 7-5 5 5 5'],
    arrow: ['M5 12h14', 'm14 7 5 5-5 5'],
    compass: ['M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z', 'm16 8-2.5 5.5L8 16l2.5-5.5L16 8Z'],
    pin: ['M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z', 'M14.5 10a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z'],
    layers: ['m12 3 10 6-10 6L2 9l10-6Z', 'm2 13 10 6 10-6', 'm2 17 10 6 10-6'],
    settings: ['M4 7h16M4 17h16', 'M9 4v6M15 14v6'],
    rotate: ['M20 7v5h-5', 'M4 17v-5h5', 'M6 7a7 7 0 0 1 12-1l2 3', 'm4 15 2 3a7 7 0 0 0 12-1'],
    zoom: ['M10.5 17a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13Z', 'm16 16 5 5', 'M8 10.5h5M10.5 8v5'],
    waves: ['M2 6c3-4 5 4 8 0s5 4 8 0 4 0 4 0', 'M2 12c3-4 5 4 8 0s5 4 8 0 4 0 4 0', 'M2 18c3-4 5 4 8 0s5 4 8 0 4 0 4 0'],
    close: ['m6 6 12 12M6 18 18 6']
  };
</script>

<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={strokeWidth} stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  {#each paths[name] || paths.globe as d}<path {d} />{/each}
</svg>
