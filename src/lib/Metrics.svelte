<script>
  import { Tween } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import c from '../content.json';
  import { stats, ago } from './stats.svelte.js';
  import { reduce } from './motion.js';

  const fmt = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });
  const rows = [
    ['github stars', () => stats.stars],
    ['svelte-chartjs / mo', () => stats.downloads],
    ['followers', () => stats.followers],
    ['public repos', () => stats.repos],
    ['years shipping', () => new Date().getFullYear() - c.since],
  ].map(([k, get]) => ({ k, get, t: new Tween(0, { duration: reduce ? 0 : 1400, easing: cubicOut }) }));

  // show: driven by a parent timeline when pinned; otherwise start counting when scrolled into view
  let { show } = $props();
  let el;
  let seen = $state(false);
  $effect(() => {
    if (show) seen = true;
  });
  $effect(() => {
    if (show !== undefined) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && ((seen = true), io.disconnect()), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  });

  $effect(() => {
    if (!seen) return;
    for (const r of rows) {
      const v = r.get();
      if (v != null) r.t.target = v;
    }
  });
</script>

<div class="metrics" aria-label="Live stats" bind:this={el}>
  <p class="head">
    <span><span class="kw">await</span> process.<span class="fn">metrics</span>()</span>
    <span class="dot" class:on={stats.live}>{stats.live ? 'live' : 'cached'}</span>
  </p>
  <dl>
    {#each rows as r}
      {#if r.get() != null}
        <div><dt>{r.k}</dt><dd>{fmt.format(Math.round(r.t.current))}</dd></div>
      {/if}
    {/each}
  </dl>
  {#if stats.lastPush}
    <p class="push">
      last push <b>{ago(stats.lastPush.at)}</b> to
      <a href="https://github.com/{stats.lastPush.repo}" target="_blank" rel="noopener">{stats.lastPush.repo}</a>
    </p>
  {/if}
</div>

<style>
  .metrics {
    background: var(--panel);
    border: 1px solid var(--line);
    border-radius: 14px;
    padding: 18px 20px 16px;
    font: 400 0.8125rem/1.5 var(--mono);
    box-shadow: 0 30px 80px -30px rgba(0, 0, 0, 0.7);
  }
  .head { display: flex; justify-content: space-between; gap: 12px; margin: 0 0 14px; color: var(--text); }
  .kw { color: var(--syn-kw); }
  .fn { color: var(--syn-fn); }
  .dot { color: var(--faint); font-size: 0.6875rem; }
  .dot::before { content: '●'; margin-right: 6px; }
  .dot.on { color: var(--syn-str); }
  .dot.on::before { animation: pulse 2s ease-in-out infinite; }
  @keyframes pulse { 50% { opacity: 0.3; } }
  dl { margin: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 14px 18px; }
  dt { color: var(--muted); font-size: 0.6875rem; }
  dd {
    margin: 2px 0 0;
    font: 600 clamp(1.5rem, 1.2rem + 1vw, 2rem)/1.1 var(--sans);
    letter-spacing: -0.03em;
    color: var(--text);
    font-variant-numeric: tabular-nums;
  }
  .push { margin: 16px 0 0; padding-top: 12px; border-top: 1px solid var(--line); color: var(--muted); font-size: 0.75rem; }
  .push b { color: var(--text); font-weight: 500; }
  .push a { color: var(--syn-key); text-decoration: none; overflow-wrap: anywhere; }
  .push a:hover { text-decoration: underline; }
  @media (prefers-reduced-motion: reduce) {
    .dot.on::before { animation: none; }
  }
</style>
