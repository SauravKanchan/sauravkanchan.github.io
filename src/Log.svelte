<script>
  import { onMount, flushSync } from 'svelte';
  import c from './content.json';
  import { hash } from './lib/code.js';
  import { gsap, scene } from './lib/motion.js';
  import { ui } from './lib/ui.svelte.js';

  const ed = c.education;
  const rows = [
    ...c.experience.map((e, i) => ({
      msg: `feat(career): ${e.role} @ ${e.company}`,
      role: e,
      refs: i ? [] : ['HEAD → main'],
    })),
    { merge: true, msg: `Initial commit: ${ed.degree}, ${ed.school} (${ed.date})` },
  ].map((r) => ({ ...r, hash: hash(r.msg) }));

  const L = 14;
  const cmd = 'git log --graph --oneline career';

  let section, list;
  let g = $state({ h: 0, dots: [], paths: [] });

  function measure() {
    const lr = list.getBoundingClientRect();
    const ys = [...list.querySelectorAll('.head')].map((el) => {
      const r = el.getBoundingClientRect();
      return r.top - lr.top + Math.min(r.height, 22) / 2;
    });
    const paths = [{ d: `M${L} ${ys[0]}V${ys.at(-1)}`, from: ys[0], to: ys.at(-1) }];
    g = { h: lr.height, dots: ys.map((y) => ({ x: L, y })), paths };
    return g;
  }

  function build() {
    const { paths, dots } = measure();
    flushSync();
    const line = '58%';
    const pathEls = list.querySelectorAll('path');
    paths.forEach((p, i) => {
      gsap.fromTo(
        pathEls[i],
        { strokeDasharray: 1, strokeDashoffset: 1 },
        {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: { trigger: list, start: `top+=${p.from} ${line}`, end: `top+=${p.to} ${line}`, scrub: 0.4 },
        },
      );
    });
    list.querySelectorAll('circle').forEach((dot, i) => {
      gsap.fromTo(
        dot,
        { scale: 0 },
        {
          scale: 1,
          transformOrigin: '50% 50%',
          ease: 'back.out(3)',
          scrollTrigger: { trigger: list, start: `top+=${dots[i].y - 10} ${line}`, end: `top+=${dots[i].y + 6} ${line}`, scrub: 0.3 },
        },
      );
    });
    list.querySelectorAll('.row').forEach((row) => {
      gsap.fromTo(
        row.querySelector('.head-text'),
        { clipPath: 'inset(0 100% 0 0)' },
        { clipPath: 'inset(0 0% 0 0)', ease: 'none', scrollTrigger: { trigger: row, start: 'top 82%', end: 'top 58%', scrub: 0.4 } },
      );
      const body = row.querySelector('.body');
      if (body)
        gsap.fromTo(
          body,
          { opacity: 0, y: 28, filter: 'blur(6px)' },
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            ease: 'power2.out',
            scrollTrigger: { trigger: row, start: 'top 70%', end: 'top 42%', scrub: 0.5 },
          },
        );
    });
    const typed = section.querySelector('.typed');
    gsap.fromTo(
      typed,
      { clipPath: 'inset(0 100% 0 0)' },
      {
        clipPath: 'inset(0 0% 0 0)',
        ease: `steps(${cmd.length})`,
        scrollTrigger: { trigger: typed, start: 'top 90%', end: 'top 60%', scrub: true },
      },
    );
    gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 50%',
        end: 'bottom 50%',
        onToggle: (s) => s.isActive && (ui.stage = 'log'),
      },
    });
  }

  onMount(() => {
    const ro = new ResizeObserver(() => measure());
    ro.observe(list);
    const stop = scene(build);
    return () => {
      ro.disconnect();
      stop();
    };
  });
</script>

<section class="log-section" id="experience" bind:this={section}>
  <header class="wrap">
    <h2>The commit history</h2>
    <p class="prompt"><span class="ps">~/career $</span> <span class="typed">{cmd}</span></p>
  </header>

  <ol class="wrap list" bind:this={list}>
    <svg class="graph" width="56" height={g.h} aria-hidden="true">
      {#each g.paths as p}<path d={p.d} pathLength="1" />{/each}
      {#each g.dots as d, i}
        <circle cx={d.x} cy={d.y} r={rows[i].merge ? 3.5 : 5} class:hollow={rows[i].merge} />
      {/each}
    </svg>

    {#each rows as r}
      <li class="row" class:minor={r.merge}>
        <div class="head">
          <span class="head-text">
            <span class="hash">{r.hash}</span>
            {#each r.refs ?? [] as ref}<span class="ref">{ref}</span>{/each}
            <span class="msg">{r.msg}</span>
          </span>
        </div>
        {#if r.role}
          <div class="body">
            <h3>{r.role.role}</h3>
            <p class="meta">{r.role.company} <span>{r.role.date}</span></p>
            <ul class="diff">
              {#each r.role.bullets as b}<li>{b}</li>{/each}
            </ul>
          </div>
        {/if}
      </li>
    {/each}
  </ol>
</section>

<style>
  .log-section { padding: clamp(96px, 16vh, 180px) 0 clamp(80px, 12vh, 140px); }
  .wrap { width: min(calc(100% - 32px), 960px); margin: 0 auto; }
  h2 {
    margin: 0;
    font: 600 clamp(2.25rem, 6vw, 4rem)/1.02 var(--sans);
    letter-spacing: -0.035em;
  }
  .prompt { margin: 18px 0 0; font: 400 clamp(0.8125rem, 0.75rem + 0.3vw, 1rem)/1.6 var(--mono); color: var(--text); }
  .ps { color: var(--syn-key); }
  .typed { display: inline-block; }

  .list { position: relative; list-style: none; padding: 0; margin-top: clamp(48px, 8vh, 88px); }
  .graph { position: absolute; left: 0; top: 0; overflow: visible; }
  .graph path { fill: none; stroke: var(--accent); stroke-width: 2; stroke-linecap: round; }
  .graph circle { fill: var(--accent); stroke: var(--bg); stroke-width: 3; }
  .graph circle.hollow { fill: var(--bg); stroke: var(--accent); stroke-width: 2; }

  .row { padding: 0 0 clamp(36px, 6vh, 64px) 64px; }
  .row.minor { padding-bottom: 28px; }
  .head { font: 400 0.8125rem/22px var(--mono); color: var(--text); }
  .head-text { display: block; }
  .hash { color: var(--syn-kw); margin-right: 10px; }
  .ref {
    color: var(--syn-key);
    border: 1px solid color-mix(in oklab, var(--syn-key) 40%, transparent);
    border-radius: 999px;
    padding: 1px 8px;
    margin-right: 10px;
    font-size: 0.75rem;
  }
  .minor .msg { color: var(--muted); }

  .body { margin-top: 14px; }
  h3 {
    margin: 0;
    font: 600 clamp(1.5rem, 1.1rem + 1.6vw, 2.25rem)/1.1 var(--sans);
    letter-spacing: -0.025em;
  }
  .meta { margin: 8px 0 0; font: 500 1.0625rem/1.4 var(--sans); color: var(--text); }
  .meta span { margin-left: 10px; font: 400 0.8125rem/1 var(--mono); color: var(--muted); }
  .diff { list-style: none; padding: 0; margin: 20px 0 0; max-width: 62ch; }
  .diff li {
    position: relative;
    padding-left: 24px;
    font: 400 1.0625rem/1.55 var(--sans);
    color: var(--muted);
  }
  .diff li + li { margin-top: 8px; }
  .diff li::before {
    content: '+';
    position: absolute;
    left: 2px;
    font: 500 0.9375rem/1.7 var(--mono);
    color: var(--syn-str);
  }

  @media (max-width: 640px) {
    .row { padding-left: 56px; }
    .head { font-size: 0.75rem; }
  }
</style>
