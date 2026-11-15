<script>
  import { onMount, flushSync } from 'svelte';
  import c from './content.json';
  import { gsap, scene } from './lib/motion.js';
  import { ui } from './lib/ui.svelte.js';

  const slug = (s) => s.toLowerCase().replace(/\(.*?\)/g, '').trim().replace(/[^a-z0-9]+/g, '-');
  const groups = [
    ['ETHGlobal', c.hackathons.recent],
    ['2018', c.hackathons.early],
  ];
  const cmd = "git branch --list 'hack/*'";

  const L = 14;
  let section, wrap;
  // y values are relative to .wrap; `top` is negative so the line starts at the section edge,
  // continuing the commit-history line from the section above
  let g = $state({ h: 0, top: 0, head: 0, ys: [] });
  const line = $derived(g.ys.length ? `M${L} ${g.top}V${g.ys.at(-1)}` : '');

  function measure() {
    const wr = wrap.getBoundingClientRect();
    const mid = (el) => {
      const r = el.getBoundingClientRect();
      return r.top - wr.top + Math.min(r.height, 20) / 2;
    };
    g = {
      h: wr.height,
      top: section.getBoundingClientRect().top - wr.top,
      head: mid(wrap.querySelector('h2')),
      ys: [...wrap.querySelectorAll('.hack .branch')].map(mid),
    };
    return g;
  }

  function build() {
    const { top, head, ys } = measure();
    flushSync();
    const y1 = ys.at(-1);
    const at = (y) => `top${y < 0 ? '-=' : '+='}${Math.abs(y)} 58%`;
    const comet = wrap.querySelector('.comet');
    const clip = wrap.querySelector('.flow-rect');
    const place = (y, p = 0) => {
      comet.setAttribute('transform', `translate(${L} ${y})`);
      comet.style.opacity = p > 0 && p < 1 ? 1 : 0;
      clip.setAttribute('y', top);
      clip.setAttribute('height', Math.max(0, y - top));
    };
    place(top);
    gsap.fromTo(
      wrap.querySelector('.prog'),
      { strokeDasharray: 1, strokeDashoffset: 1 },
      {
        strokeDashoffset: 0, autoRound: false,
        ease: 'none',
        scrollTrigger: { trigger: wrap, start: at(top), end: at(y1), scrub: 0.4 },
        onUpdate() {
          place(top + (y1 - top) * this.progress(), this.progress());
        },
      },
    );
    [head, ...ys].forEach((y, i) => {
      const t = { trigger: wrap, start: at(y - 10), end: at(y + 6), scrub: 0.3 };
      const dot = wrap.querySelectorAll('.dot')[i];
      gsap.fromTo(dot, { attr: { r: 0 } }, { attr: { r: +dot.getAttribute('r') }, ease: 'back.out(3)', scrollTrigger: t });
      // flash in then expand out, so the ring is invisible both before and after the comet passes
      gsap
        .timeline({ scrollTrigger: { ...t, end: at(y + 60) } })
        .fromTo(wrap.querySelectorAll('.ripple')[i], { attr: { r: 5 }, opacity: 0 }, { opacity: 0.9, duration: 0.05 })
        .to(wrap.querySelectorAll('.ripple')[i], { attr: { r: 26 }, opacity: 0, ease: 'power1.out', duration: 0.95 });
    });

    gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 50%',
        end: 'bottom 50%',
        onToggle: (s) => s.isActive && (ui.stage = 'hacks'),
      },
    });
    const typed = section.querySelector('.typed');
    gsap.fromTo(
      typed,
      { clipPath: 'inset(0 100% 0 0)' },
      { clipPath: 'inset(0 0% 0 0)', ease: `steps(${cmd.length})`, scrollTrigger: { trigger: typed, start: 'top 90%', end: 'top 62%', scrub: true } },
    );
    section.querySelectorAll('.hack').forEach((row) => {
      gsap
        .timeline({ scrollTrigger: { trigger: row, start: 'top 90%', end: 'top 60%', scrub: 0.5 } })
        .fromTo(row.querySelector('.branch'), { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', ease: 'none' }, 0)
        .fromTo(
          row.querySelector('.info'),
          { opacity: 0, y: 16, filter: 'blur(6px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', ease: 'power2.out' },
          0.3,
        );
    });
  }

  onMount(() => {
    const ro = new ResizeObserver(() => measure());
    ro.observe(wrap);
    const stop = scene(build);
    return () => {
      ro.disconnect();
      stop();
    };
  });
</script>

<section class="hacks" id="hackathons" bind:this={section}>
  <div class="wrap" bind:this={wrap}>
    <svg class="graph" width="56" height={g.h} aria-hidden="true">
      <defs>
        <radialGradient id="halo"><stop offset="0" stop-color="#f4c28c" stop-opacity="0.75" /><stop offset="1" stop-color="#e9a866" stop-opacity="0" /></radialGradient>
        <clipPath id="flow-clip"><rect class="flow-rect" x="0" y="0" width="56" height="0" /></clipPath>
      </defs>
      <path class="track" d={line} />
      <path class="prog" d={line} pathLength="1" />
      <path class="flow" d={line} clip-path="url(#flow-clip)" />
      {#each [g.head, ...g.ys] as y, i}
        <circle class="ripple" cx={L} cy={y} r="5" />
        <circle class="dot" class:hollow={i === 0} cx={L} cy={y} r={i === 0 ? 6 : 4.5} />
      {/each}
      <g class="comet"><circle r="14" fill="url(#halo)" /><circle r="3" class="core" /></g>
    </svg>
    <h2>Hackathons</h2>
    <p class="prompt"><span class="ps">~/career $</span> <span class="typed">{cmd}</span></p>

    {#each groups as [label, items]}
      <h3 class="group">{label}</h3>
      <ul>
        {#each items as h}
          <li class="hack">
            <code class="branch">hack/{slug(h.event)}</code>
            <div class="info">
              <p class="event">{h.event}</p>
              <p class="result">{h.result}{#if h.project}<span>{' · '}{h.project}</span>{/if}</p>
            </div>
          </li>
        {/each}
      </ul>
    {/each}
  </div>
</section>

<style>
  .hacks { padding: clamp(64px, calc(10 * var(--vu, 1vh)), 120px) 0; }
  .wrap { position: relative; width: min(calc(100% - 32px), 960px); margin: 0 auto; padding-left: 64px; }

  .graph { position: absolute; left: 0; top: 0; overflow: visible; }
  .graph path { fill: none; stroke-width: 2; stroke-linecap: round; }
  .track { stroke: var(--line); }
  .prog { stroke: var(--accent); }
  .flow { stroke: #ffe3c2; stroke-dasharray: 2 18; animation: flow 1.1s linear infinite; }
  .ripple { fill: none; stroke: var(--accent); stroke-width: 1.5; opacity: 0; }
  .dot { fill: var(--accent); stroke: var(--bg); stroke-width: 3; }
  .dot.hollow { fill: var(--bg); stroke: var(--accent); stroke-width: 2.5; }
  .core { fill: #fff3e3; }
  @keyframes flow { to { stroke-dashoffset: -20; } }
  @media (prefers-reduced-motion: reduce) {
    .flow { animation: none; }
    .comet { display: none; }
  }
  h2 { margin: 0; font: 600 clamp(2.25rem, 6vw, 4rem)/1.02 var(--sans); letter-spacing: -0.035em; }
  .prompt { margin: 18px 0 0; font: 400 clamp(0.8125rem, 0.75rem + 0.3vw, 1rem)/1.6 var(--mono); }
  .ps { color: var(--syn-key); }
  .typed { display: inline-block; }
  .group {
    margin: clamp(40px, calc(6 * var(--vu, 1vh)), 64px) 0 4px;
    font: 400 0.75rem/1 var(--mono);
    color: var(--syn-type);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  ul { list-style: none; padding: 0; margin: 0; }
  .hack {
    display: grid;
    grid-template-columns: minmax(0, 22ch) 1fr;
    gap: 8px 32px;
    align-items: baseline;
    padding: 20px 0;
    border-top: 1px solid var(--line);
  }
  .branch {
    font: 400 0.8125rem/1.5 var(--mono);
    color: var(--syn-type);
    overflow-wrap: anywhere;
  }
  .event { margin: 0; font: 500 clamp(1.125rem, 1rem + 0.5vw, 1.375rem)/1.3 var(--sans); letter-spacing: -0.015em; color: var(--text); }
  .result { margin: 4px 0 0; font: 400 0.875rem/1.5 var(--mono); color: var(--syn-fn); }
  .result span { color: var(--muted); }

  @media (max-width: 640px) {
    .wrap { padding-left: 56px; }
    .hack { grid-template-columns: 1fr; }
  }
</style>
