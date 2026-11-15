<script>
  import { onMount } from 'svelte';
  import Lenis from 'lenis';
  import Hero from './Hero.svelte';
  import Log from './Log.svelte';
  import Hackathons from './Hackathons.svelte';
  import Packages from './Packages.svelte';
  import Research from './Research.svelte';
  import Modules from './Modules.svelte';
  import Contact from './Contact.svelte';
  import { gsap, ScrollTrigger, reduce, rebuildAll, setVh } from './lib/motion.js';
  import { ui, STAGES } from './lib/ui.svelte.js';
  import { loadStats } from './lib/stats.svelte.js';


  let bar;

  onMount(() => {
    loadStats().catch((e) => console.warn('live stats failed', e));
    if (reduce) {
      document.documentElement.classList.add('rm');
      addEventListener('resize', setVh);
      return () => removeEventListener('resize', setVh);
    }
    const lenis = new Lenis({ lerp: 0.1 });
    lenis.on('scroll', ScrollTrigger.update);
    const raf = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    gsap.to(bar, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: { start: 0, end: 'max', scrub: true },
    });

    let w = innerWidth;
    let t;
    const onResize = () => {
      if (innerWidth === w) return;
      w = innerWidth;
      setVh();
      clearTimeout(t);
      t = setTimeout(rebuildAll, 200);
    };
    addEventListener('resize', onResize);

    // Web fonts and live stats arrive after first layout and change section heights, which leaves
    // every trigger and pin below them stale. Re-measure whenever a section's own size settles on a
    // new value (pin spacers don't change section sizes, so this can't feed back on itself).
    const sections = [...document.querySelectorAll('main > section, main > .pin-spacer > section')];
    const sig = () => sections.map((el) => el.offsetHeight).join();
    let last = sig();
    let rt;
    const ro = new ResizeObserver(() => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        const now = sig();
        if (now === last) return;
        last = now;
        rebuildAll();
      }, 150);
    });
    sections.forEach((el) => ro.observe(el));
    // next frame: this hook can run inside a section's flushSync, before that section has finished building
    requestAnimationFrame(rebuildAll);
    document.fonts.ready.then(rebuildAll);

    return () => {
      ro.disconnect();
      removeEventListener('resize', onResize);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  });
</script>

<header class="top">
  <a class="who" href="#top">saurav<span>.ts</span></a>
  <ol class="pipe" aria-label="Build stage">
    {#each STAGES as s}
      <li class:on={ui.stage === s} aria-current={ui.stage === s ? 'step' : undefined}>{s}</li>
    {/each}
  </ol>
  <i class="progress" bind:this={bar}></i>
</header>

<main id="top">
  <Hero />
  <Log />
  <Hackathons />
  <Packages />
  <Research />
  <Modules />
  <Contact />
</main>

<style>
  .top {
    position: fixed;
    z-index: 10;
    inset: 0 0 auto;
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    padding: 0 20px;
    background: rgb(21 18 14 / 0.72);
    backdrop-filter: blur(16px) saturate(140%);
    -webkit-backdrop-filter: blur(16px) saturate(140%);
    font: 500 0.75rem/1 var(--mono);
  }
  .who { color: var(--text); text-decoration: none; }
  .who span { color: var(--muted); }
  .pipe { display: flex; gap: 4px; list-style: none; margin: 0; padding: 0; }
  .pipe li {
    padding: 6px 9px;
    border-radius: 6px;
    color: var(--faint);
    transition: color 0.3s, background-color 0.3s;
  }
  .pipe li + li::before { content: '›'; margin-right: 10px; color: var(--line-2); }
  .pipe li.on { color: var(--accent); }
  .progress {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 1px;
    background: var(--accent);
    transform: scaleX(0);
    transform-origin: left;
  }
  .progress::after {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--line);
    z-index: -1;
  }
  @media (max-width: 860px) {
    .pipe li:not(.on) { display: none; }
    .pipe li + li::before { content: none; }
    .pipe li.on::before { content: '● '; font-size: 0.5rem; vertical-align: 2px; }
  }
  @media (prefers-reduced-transparency: reduce) {
    .top { background: var(--bg); backdrop-filter: none; }
  }
  :global(.rm) .progress { transform: none; opacity: 0.4; }
</style>
