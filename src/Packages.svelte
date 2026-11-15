<script>
  import { onMount, flushSync } from 'svelte';
  import c from './content.json';
  import Icon from './lib/Icon.svelte';
  import Metrics from './lib/Metrics.svelte';
  import { stats } from './lib/stats.svelte.js';
  import { gsap, scene } from './lib/motion.js';
  import { ui } from './lib/ui.svelte.js';

  const fmt = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });
  const cmd = 'npm ls --all';
  const pkg = (n) => n.toLowerCase().replace(/\s+/g, '-');
  const hacks = [...c.hackathons.recent, ...c.hackathons.early];
  const projects = c.projects.map((p) => {
    const [kind, ...rest] = p.kind.split(' · ');
    return { ...p, slug: pkg(p.name), kind, rank: hacks.find((h) => h.project === p.name)?.result ?? rest.join(' · ') };
  });
  const stars = (p) => (p.repo ? stats.repoStars[p.repo] : null);
  // node radius encodes live stars (area ~ stars); repo-less packages get a hollow minimum node
  const radius = (p) => (stars(p) == null ? 5 : Math.min(15, 5 + Math.sqrt(stars(p)) * 0.45));

  let section, graph;
  // k: per-node growth 0..1, driven by the scroll timeline so live star counts can still resize nodes
  const grow = $state(projects.map(() => ({ k: 1 })));
  let g = $state({ w: 0, h: 0, tree: false, edges: [], ports: [] });
  let spark = $state('');

  function measure() {
    const gr = graph.getBoundingClientRect();
    const rel = (r) => ({ l: r.left - gr.left, r: r.right - gr.left, t: r.top - gr.top, b: r.bottom - gr.top });
    const tree = matchMedia('(max-width: 860px)').matches;
    const root = rel(graph.querySelector('.root').getBoundingClientRect());
    const rdot = rel(graph.querySelector('.rdot').getBoundingClientRect());
    const cards = [...graph.querySelectorAll('.card')].map((el) => rel(el.getBoundingClientRect()));
    const ports = [];
    const edges = cards.map((b, i) => {
      if (tree) {
        // npm ls style: trunk down from the previous branch, elbow into the card's left edge
        const x = (rdot.l + rdot.r) / 2;
        const y0 = i ? Math.min(cards[i - 1].t + 34, b.t) : rdot.b;
        const y = b.t + 34;
        return { d: `M${x} ${y0}V${y - 10}Q${x} ${y} ${x + 10} ${y}H${b.l}`, x: b.l, y };
      }
      const left = b.r < root.l;
      const ox = left ? root.l : root.r;
      const oy = (root.t + root.b) / 2;
      const ax = left ? b.r : b.l;
      const ay = (b.t + b.b) / 2;
      const mx = (ox + ax) / 2;
      ports.push({ x: ox, y: oy });
      return { d: `M${ox} ${oy}C${mx} ${oy} ${mx} ${ay} ${ax} ${ay}`, x: ax, y: ay };
    });
    g = { w: gr.width, h: gr.height, tree, edges, ports };
    return g;
  }

  async function loadSpark(name) {
    try {
      const r = await fetch(`https://api.npmjs.org/downloads/range/last-year/${name}`);
      if (!r.ok) throw new Error(`${r.status} npm range`);
      const days = (await r.json()).downloads;
      const weeks = [];
      for (let i = 0; i + 7 <= days.length; i += 7) weeks.push(days.slice(i, i + 7).reduce((s, d) => s + d.downloads, 0));
      const max = Math.max(...weeks);
      if (weeks.length < 2 || !max) return;
      spark = weeks.map((v, i) => `${((i / (weeks.length - 1)) * 300).toFixed(1)},${(26 - (v / max) * 24).toFixed(1)}`).join(' ');
    } catch (e) {
      console.warn('npm download history failed', e);
    }
  }

  function build() {
    const { tree } = measure();
    flushSync();
    gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 50%',
        end: 'bottom 50%',
        onToggle: (s) => s.isActive && (ui.stage = 'packages'),
      },
    });
    const typed = section.querySelector('.typed');
    gsap.fromTo(
      typed,
      { clipPath: 'inset(0 100% 0 0)' },
      { clipPath: 'inset(0 0% 0 0)', ease: `steps(${cmd.length})`, scrollTrigger: { trigger: typed, start: 'top 90%', end: 'top 62%', scrub: true } },
    );

    const edges = graph.querySelectorAll('.edge');
    const cards = graph.querySelectorAll('.card');
    const ports = graph.querySelectorAll('.port');
    // the card unfolds out of its node: a circle clip centred on the edge's endpoint
    const at = (i) => (tree ? '0% 34px' : i % 2 ? '0% 50%' : '100% 50%');
    const step = (tl, i, t) => {
      tl
        .fromTo(edges[i], { strokeDashoffset: 1 }, { strokeDashoffset: 0, autoRound: false, ease: 'power1.inOut', duration: 1 }, t)
        .fromTo(grow[i], { k: 0 }, { k: 1, ease: 'back.out(3)', duration: 0.4 }, t + 0.85)
        .fromTo(
          cards[i],
          { clipPath: `circle(0% at ${at(i)})`, opacity: 0.4 },
          { clipPath: `circle(150% at ${at(i)})`, opacity: 1, ease: 'power2.in', duration: 1 },
          t + 0.75,
        );
      const line = cards[i].querySelector('.spark-line');
      if (line) tl.fromTo(line, { strokeDashoffset: 1 }, { strokeDashoffset: 0, autoRound: false, ease: 'none', duration: 0.8 }, t + 1.25);
    };

    const root = graph.querySelector('.root');
    if (tree) {
      gsap.fromTo(root, { opacity: 0, x: -12 }, { opacity: 1, x: 0, scrollTrigger: { trigger: root, start: 'top 90%', end: 'top 70%', scrub: 0.4 } });
      cards.forEach((card, i) =>
        step(gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 92%', end: 'top 45%', scrub: 0.5 } }), i, 0),
      );
    } else {
      const tl = gsap.timeline({ scrollTrigger: { trigger: graph, start: 'top 72%', end: 'bottom 88%', scrub: 0.6 } });
      tl.fromTo(root, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, ease: 'back.out(2)', duration: 0.6 }, 0);
      tl.fromTo(ports, { attr: { r: 0 } }, { attr: { r: 4 }, duration: 0.3 }, 0.4);
      projects.forEach((_, i) => step(tl, i, 0.6 + i * 0.7));
    }
    gsap.fromTo(
      graph.querySelectorAll('.flow'),
      { opacity: 0 },
      { opacity: 1, scrollTrigger: { trigger: graph, start: 'bottom 85%', end: 'bottom 70%', scrub: true } },
    );
  }

  onMount(() => {
    const p = projects.find((p) => p.npm);
    if (p) loadSpark(p.npm);
    const ro = new ResizeObserver(() => measure());
    ro.observe(graph);
    const stop = scene(build);
    return () => {
      ro.disconnect();
      stop();
    };
  });
</script>

<section class="packages" id="projects" bind:this={section}>
  <div class="wrap">
    <h2>Shipped packages</h2>
    <p class="prompt"><span class="ps">~/oss $</span> <span class="typed">{cmd}</span></p>

    <div class="graph" class:tree={g.tree} bind:this={graph}>
      <svg class="wires" width={g.w} height={g.h} aria-hidden="true">
        {#each g.edges as e}
          <path class="track" d={e.d} />
          <path class="edge" d={e.d} pathLength="1" />
          <path class="flow" d={e.d} />
        {/each}
        {#each g.ports as pt}
          <circle class="port" cx={pt.x} cy={pt.y} r="4" />
        {/each}
        {#each g.edges as e, i}
          {@const p = projects[i]}
          <circle class="node" class:hollow={stars(p) == null} cx={e.x} cy={e.y} r={radius(p) * grow[i].k} />
        {/each}
      </svg>

      <div class="root">
        <span class="rdot" aria-hidden="true"></span>
        <span class="rname">saurav<span class="at">@runtime</span></span>
        <span class="rsub">{projects.length} deps · ★ {fmt.format(stats.stars)}</span>
      </div>

      {#each projects as p, i}
        <svelte:element
          this={p.link ? 'a' : 'div'}
          class="card c{i}"
          href={p.link}
          target={p.link ? '_blank' : undefined}
          rel={p.link ? 'noopener' : undefined}
        >
          <span class="top">
            <span class="name">{p.slug}<span class="ver">@{p.date}</span></span>
            {#if p.link}<Icon name="arrow" size={16} />{/if}
          </span>
          <span class="badges">
            <span class="badge">{p.kind}</span>
            {#if p.rank}<span class="badge hl">{p.rank}</span>{/if}
            {#if p.npm}<span class="badge npm">npm</span>{/if}
          </span>
          <span class="desc">{p.description}</span>
          {#if stars(p) != null || (p.npm && stats.downloads != null)}
            <span class="nums">
              {#if stars(p) != null}<span>★ {fmt.format(stars(p))} stars</span>{/if}
              {#if p.npm && stats.downloads != null}<span>↓ {fmt.format(stats.downloads)} / month</span>{/if}
            </span>
          {/if}
          {#if p.npm && spark}
            <span class="spark" aria-label="Weekly npm downloads over the last year">
              <svg viewBox="0 0 300 28" preserveAspectRatio="none" aria-hidden="true">
                <polyline class="spark-line" points={spark} pathLength="1" />
              </svg>
              <span class="spark-cap">weekly downloads · last 12 mo</span>
            </span>
          {/if}
        </svelte:element>
      {/each}
    </div>

    <div class="mobile-metrics"><Metrics /></div>

    <p class="summary"><b>{projects.length} packages</b>, deduped · found 0 vulnerabilities</p>
  </div>
</section>

<style>
  .packages { padding: clamp(96px, calc(16 * var(--vu, 1vh)), 180px) 0 clamp(64px, calc(10 * var(--vu, 1vh)), 120px); }
  .wrap { width: min(calc(100% - 32px), 1120px); margin: 0 auto; }
  h2 { margin: 0; font: 600 clamp(2.25rem, 6vw, 4rem)/1.02 var(--sans); letter-spacing: -0.035em; }
  .prompt { margin: 18px 0 0; font: 400 clamp(0.8125rem, 0.75rem + 0.3vw, 1rem)/1.6 var(--mono); }
  .ps { color: var(--syn-key); }
  .typed { display: inline-block; }

  .graph {
    position: relative;
    margin-top: clamp(40px, calc(7 * var(--vu, 1vh)), 72px);
    display: grid;
    grid-template-columns: minmax(0, 1fr) clamp(200px, 24vw, 300px) minmax(0, 1fr);
    grid-template-areas: 'c0 root c1' 'c2 root c3';
    row-gap: clamp(56px, calc(9 * var(--vu, 1vh)), 96px);
  }
  .c0 { grid-area: c0; }
  .c1 { grid-area: c1; }
  .c2 { grid-area: c2; }
  .c3 { grid-area: c3; }

  .wires { position: absolute; left: 0; top: 0; overflow: visible; pointer-events: none; z-index: 2; }
  .wires path { fill: none; stroke-width: 1.5; stroke-linecap: round; }
  .track { stroke: var(--line); stroke-dasharray: 3 5; }
  .edge { stroke: var(--accent); stroke-dasharray: 1; opacity: 0.85; }
  .flow { stroke: #ffe3c2; stroke-dasharray: 2 22; animation: flow 1.4s linear infinite; opacity: 0.8; }
  @keyframes flow { to { stroke-dashoffset: -24; } }
  .port { fill: var(--bg); stroke: var(--accent); stroke-width: 1.5; }
  .node { fill: var(--accent); stroke: var(--bg); stroke-width: 3; }
  .node.hollow { fill: var(--bg); stroke: var(--accent); stroke-width: 2; }

  .root {
    grid-area: root;
    align-self: center;
    justify-self: center;
    display: grid;
    justify-items: center;
    gap: 6px;
    padding: 18px 20px;
    background: var(--bg-2);
    border: 1px solid var(--line-2);
    border-radius: 999px;
    font-family: var(--mono);
    box-shadow: 0 0 0 6px var(--bg), 0 0 60px -10px rgb(233 168 102 / 0.35);
    position: relative;
    z-index: 1;
  }
  .rdot { width: 12px; height: 12px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 16px var(--accent); }
  .rname { font: 500 1rem/1.2 var(--mono); color: var(--text); }
  .at { color: var(--faint); }
  .rsub { font: 400 0.6875rem/1.2 var(--mono); color: var(--syn-fn); }

  .card {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 20px 22px;
    background: var(--panel);
    border: 1px solid var(--line);
    border-radius: 14px;
    color: inherit;
    text-decoration: none;
    min-width: 0;
    transition: border-color 0.2s;
  }
  a.card:hover { border-color: var(--line-2); }
  .top { display: flex; justify-content: space-between; gap: 12px; align-items: baseline; }
  .top :global(svg) { flex: none; color: var(--faint); transition: color 0.2s, transform 0.25s; }
  a.card:hover .top :global(svg) { color: var(--accent); transform: translate(2px, -2px); }
  .name { font: 500 clamp(1rem, 0.9rem + 0.4vw, 1.1875rem)/1.3 var(--mono); color: var(--text); overflow-wrap: anywhere; }
  .ver { color: var(--faint); font-size: 0.75em; margin-left: 2px; }
  .badges { display: flex; flex-wrap: wrap; gap: 6px; }
  .badge {
    font: 400 0.6875rem/1 var(--mono);
    padding: 5px 8px;
    border-radius: 6px;
    border: 1px solid var(--line);
    color: var(--syn-type);
  }
  .badge.hl { color: var(--accent); border-color: rgb(233 168 102 / 0.4); background: rgb(233 168 102 / 0.08); }
  .badge.npm { color: var(--syn-num); }
  .desc { font: 400 0.9375rem/1.55 var(--sans); color: var(--muted); }
  .nums { display: flex; flex-wrap: wrap; gap: 4px 18px; margin-top: auto; padding-top: 4px; font: 500 0.8125rem/1.4 var(--mono); color: var(--syn-fn); }
  .spark { display: grid; gap: 4px; }
  .spark svg { width: 100%; height: 28px; overflow: visible; }
  .spark-line { fill: none; stroke: var(--syn-fn); stroke-width: 1.5; stroke-dasharray: 1; stroke-linejoin: round; }
  .spark-cap { font: 400 0.625rem/1 var(--mono); color: var(--faint); }

  .mobile-metrics { display: none; margin-top: 40px; }
  @media (max-width: 1000px) {
    .mobile-metrics { display: block; }
  }
  .summary { margin: 28px 0 0; font: 400 0.8125rem/1.5 var(--mono); color: var(--muted); }
  .summary b { color: var(--text); font-weight: 500; }

  @media (max-width: 860px) {
    .graph { grid-template-columns: minmax(0, 1fr); grid-template-areas: none; row-gap: 18px; }
    .c0, .c1, .c2, .c3 { grid-area: auto; }
    .root {
      grid-area: auto;
      justify-self: start;
      grid-auto-flow: column;
      align-items: center;
      gap: 10px;
      padding: 0;
      background: none;
      border: 0;
      box-shadow: none;
    }
    .rsub { margin-left: 4px; }
    .card { margin-left: 34px; padding: 18px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .flow { animation: none; }
  }
</style>
