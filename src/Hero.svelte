<script>
  import { onMount, flushSync } from 'svelte';
  import c from './content.json';
  import { hash } from './lib/code.js';
  import { gsap, scene, reduce } from './lib/motion.js';
  import Intro from './Intro.svelte';
  import { ui } from './lib/ui.svelte.js';

  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const [bs, arcana, blocklogy, mahindra] = c.experience;
  const pkgs = c.projects.filter((p) => p.npm || p.mine);
  const { early, recent } = c.hackathons;

  // off: lane offset from main when lanes run horizontally; col: column when they run vertically
  const B = {
    main: { name: 'main', color: 'var(--accent)', off: 0, col: 0 },
    [slug(mahindra.company)]: { color: 'var(--syn-key)', off: -1, col: 1 },
    [slug(blocklogy.company)]: { color: 'var(--syn-type)', off: 1, col: 2 },
    packages: { color: 'var(--syn-fn)', off: -2, col: 3 },
    [slug(arcana.company)]: { color: 'var(--syn-str)', off: 2, col: 4 },
    hackathons: { color: 'var(--syn-num)', off: -3, col: 5 },
    [slug(bs.company)]: { color: 'color-mix(in oklab, var(--syn-type) 55%, var(--syn-num))', off: 3, col: 6 },
  };
  for (const k in B) B[k].name ??= k;

  // chronological; t is the slot along the time axis
  const commits = [
    ['main', c.education.degree],
    ['hackathons', early[0].event],
    ['hackathons', early[1].event],
    [slug(mahindra.company), mahindra.role],
    [slug(blocklogy.company), blocklogy.role],
    [slug(arcana.company), arcana.role],
    ['packages', pkgs[0].name],
    ['packages', pkgs[1].name],
    ...[...recent].reverse().map((h) => ['hackathons', h.event]),
    [slug(bs.company), bs.role],
  ].map(([b, msg], t) => ({ b, msg, t, hash: hash(b + msg) }));

  const merges = [slug(mahindra.company), slug(blocklogy.company), 'packages', slug(arcana.company), 'hackathons', slug(bs.company)].map(
    (b, i) => ({ b, t: commits.length + i, hash: hash('merge ' + b) }),
  );
  const LAST = merges.at(-1).t;
  const branches = Object.keys(B).filter((k) => k !== 'main');
  const tips = new Set(branches.map((b) => commits.findLast((x) => x.b === b)));

  const files =
    c.experience.length + c.projects.length + early.length + recent.length +
    c.achievements.papers.length + c.achievements.certifications.length + c.blogs.length + c.talks.length;
  const headHash = hash(c.name + c.since);


  let root, stage, graph, con, head, refEl, out;
  let view = $state({ w: 0, h: 0, vert: false, paths: [], dots: [], mdots: [], labels: [], tag: null, lx: 0 });

  function layout(W, H) {
    const vert = W < 900 || W / H < 1.15;
    if (!vert) {
      const top = 112, bottom = 96;
      const x0 = 84, s = (W - x0 - 64) / LAST;
      const yc = (top + H - bottom) / 2;
      const ls = Math.min(92, (H - top - bottom) / 6);
      return { vert, s, at: (t, b) => ({ x: x0 + t * s, y: yc + B[b].off * ls }) };
    }
    const small = W < 500;
    const top = small ? 92 : 120, bottom = small ? 70 : 100;
    const ls = small ? 17 : 26;
    const gw = 6 * ls;
    const lw = Math.min(300, W - 32 - gw - 22);
    const gx0 = (W - (gw + 22 + lw)) / 2;
    const s = (H - top - bottom) / LAST;
    return { vert, lx: gx0 + gw + 22, at: (t, b) => ({ x: gx0 + B[b].col * ls, y: top + t * s }) };
  }

  function curve(A, Z, vert) {
    if (vert) {
      const m = (A.y + Z.y) / 2;
      return `C${A.x} ${m} ${Z.x} ${m} ${Z.x} ${Z.y}`;
    }
    const m = (A.x + Z.x) / 2;
    return `C${m} ${A.y} ${m} ${Z.y} ${Z.x} ${Z.y}`;
  }

  function build() {
    const sr = stage.getBoundingClientRect();
    const W = sr.width;
    const H = sr.height;
    const { vert, at, lx, s } = layout(W, H);
    const pt = (p) => `${p.x} ${p.y}`;

    const paths = [{ b: 'main', kind: 'main', d: `M${pt(at(0, 'main'))}L${pt(at(LAST, 'main'))}` }];
    for (const b of branches) {
      const own = commits.filter((x) => x.b === b);
      const f = own[0].t - 0.9;
      const l = own.at(-1).t;
      const m = merges.find((x) => x.b === b).t;
      const F = at(f, 'main'), F2 = at(f + 0.8, b), Lp = at(l, b), M1 = at(m - 0.8, b), M = at(m, 'main');
      paths.push({ b, kind: 'branch', d: `M${pt(F)}${curve(F, F2, vert)}L${pt(Lp)}` });
      paths.push({ b, kind: 'merge', d: `M${pt(Lp)}L${pt(M1)}${curve(M1, M, vert)}` });
    }

    // horizontal: alternate labels above/below so neighbours on one lane never collide
    const lastSide = {};
    const labels = commits.map((x) => {
      const p = at(x.t, x.b);
      let side = 'mid';
      if (!vert) {
        side = x.b === 'main' ? 'below' : lastSide[x.b] === 'above' ? 'below' : 'above';
        lastSide[x.b] = side;
      }
      return { ...x, x: vert ? lx : p.x, y: p.y, side, tip: tips.has(x) };
    });
    // wrap a label only when the next one on the same lane and side would run into it
    for (const l of labels) {
      const next = labels.find((n) => n.t > l.t && n.b === l.b && n.side === l.side);
      l.max = !vert && next ? (next.t - l.t) * s - 14 : null;
    }
    if (vert) for (const m of merges) labels.push({ ...m, merge: true, x: lx, y: at(m.t, 'main').y, side: 'mid' });

    view = {
      w: W,
      h: H,
      vert,
      lx,
      tag: at(0, 'main'),
      paths,
      labels,
      dots: commits.map((x) => ({ ...x, ...at(x.t, x.b) })),
      mdots: merges.map((x) => ({ ...x, ...at(x.t, 'main') })),
    };

    flushSync();
    const q = (s) => [...graph.querySelectorAll(s)];
    const pathEl = (b, kind) => graph.querySelector(`path.ink[data-b="${b}"][data-kind="${kind}"]`);
    const dotEls = q('.dot');
    const mdotEls = q('.mdot');
    const rings = q('.ring');
    const labelEls = q('.lb');
    const textEls = q('.lt');
    const cx = W / 2;
    const cy = H / 2;

    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut', duration: 1 },
      scrollTrigger: {
        trigger: root,
        start: 'top top',
        end: () => '+=' + innerHeight * 4.6,
        pin: true,
        scrub: 0.6,
        onUpdate: (s) => {
          const p = s.progress;
          ui.stage = p < 0.03 ? 'source' : p < 0.25 ? 'parse' : p < 0.74 ? 'build' : 'run';
        },
      },
    });

    gsap.set([graph, con], { autoAlpha: 1 });
    gsap.set([out, refEl], { autoAlpha: 0 });
    gsap.set(q('path.ink'), { strokeDasharray: '1 2', strokeDashoffset: 1 });
    gsap.set([...dotEls, ...mdotEls], { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(textEls, { opacity: 0 });
    gsap.set(rings, { opacity: 0 });

    // 1 · the graph draws itself, commit by commit
    const T = (t) => 0.15 + t * 0.2;
    const main = pathEl('main', 'main');
    tl.to(main, { strokeDashoffset: 1 - (commits.length - 0.5) / LAST, autoRound: false, ease: 'none', duration: T(commits.length - 0.5) - 0.1 }, 0.1);
    for (const b of branches) {
      const own = commits.filter((x) => x.b === b);
      const t0 = T(own[0].t - 0.9);
      tl.to(pathEl(b, 'branch'), { strokeDashoffset: 0, autoRound: false, ease: 'none', duration: Math.max(0.2, T(own.at(-1).t) - t0) }, t0);
    }
    commits.forEach((x, i) => {
      tl.to(dotEls[i], { scale: 1, duration: 0.25, ease: 'back.out(3)' }, T(x.t));
      tl.fromTo(textEls[i], { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' }, T(x.t) + 0.05);
    });
    const conLines = [...con.querySelectorAll('.cl')];
    gsap.set(conLines.slice(1), { autoAlpha: 0, y: 10 });

    // 2 · git merge, one branch at a time
    const M0 = 2.75;
    const step = 0.5;
    merges.forEach((m, i) => {
      const at0 = M0 + i * step;
      const hit = at0 + 0.32;
      tl.to(conLines[i], { autoAlpha: 0, y: -10, duration: 0.2 }, at0);
      tl.to(conLines[i + 1], { autoAlpha: 1, y: 0, duration: 0.2 }, at0 + 0.1);
      tl.to(pathEl(m.b, 'merge'), { strokeDashoffset: 0, autoRound: false, ease: 'power1.in', duration: 0.32 }, at0);
      tl.to(main, { strokeDashoffset: 1 - m.t / LAST, autoRound: false, ease: 'none', duration: 0.32 }, at0);
      tl.to(mdotEls[i], { scale: 1, duration: 0.2, ease: 'back.out(3)' }, hit);
      tl.fromTo(rings[i], { opacity: 0.9, attr: { r: 5 } }, { opacity: 0, attr: { r: vert ? 18 : 26 }, duration: 0.4, ease: 'power2.out', immediateRender: false }, hit);
      if (vert) tl.fromTo(textEls[commits.length + i], { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.25, ease: 'power2.out' }, hit);
      tl.to(q(`[data-b="${m.b}"]:not(.lb)`).concat(labelEls.filter((el) => el.dataset.b === m.b && !el.classList.contains('merge'))), { opacity: 0.55, duration: 0.3 }, hit + 0.1);
    });

    // 3 · everything collapses into HEAD
    const C0 = M0 + merges.length * step + 0.35;
    tl.to(conLines.at(-1), { autoAlpha: 0, y: -10, duration: 0.3 }, C0);
    tl.to(con, { autoAlpha: 0, duration: 0.3 }, C0 + 0.2);
    tl.to([...labelEls, graph.querySelector('.tag')], { opacity: 0, duration: 0.35, stagger: 0.01 }, C0);
    tl.to(q('path.ink'), { strokeDashoffset: -1.02, autoRound: false, duration: 0.8, ease: 'power2.in', stagger: 0.02 }, C0 + 0.1);
    tl.to(q('path.ghost'), { opacity: 0, duration: 0.5 }, C0);
    [...dotEls, ...mdotEls].forEach((el, i) => {
      const bb = el.getBBox();
      const dx = cx - (bb.x + bb.width / 2);
      const dy = cy - (bb.y + bb.height / 2);
      tl.to(el, { x: dx, y: dy, opacity: 0, scale: 0.6, duration: 0.9, ease: 'power3.in' }, C0 + 0.1 + i * 0.015);
    });

    const avatar = out.querySelector('.avatar');
    const inner = out.querySelector('.out-inner');
    // pinned at 100svh with overflow hidden: shrink the intro on short phones rather than clip it
    const cs = getComputedStyle(out);
    const room = out.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    // an overflowing grid track starts at the top padding edge, so scale from there
    gsap.set(inner, { scale: Math.min(1, room / inner.offsetHeight), transformOrigin: '0% 0%' });
    const ar = avatar.getBoundingClientRect();
    const aw = ar.width;
    const dot = 28;
    gsap.set(head, { width: aw, height: aw, xPercent: -50, yPercent: -50, x: cx, y: cy, scale: 0, autoAlpha: 0 });
    gsap.set(refEl, { xPercent: -50, x: cx, y: cy });

    const H0 = C0 + 1.05;
    tl.to(head, { autoAlpha: 1, scale: dot / aw, duration: 0.4, ease: 'back.out(2.5)' }, H0);
    tl.fromTo(graph.querySelector('.burst'), { opacity: 0.8, attr: { r: 10 } }, { opacity: 0, attr: { r: Math.min(W, H) * 0.35 }, duration: 0.9, ease: 'power2.out', immediateRender: false }, H0);
    tl.fromTo(refEl, { autoAlpha: 0, y: cy + 8 }, { autoAlpha: 1, y: cy, duration: 0.4, ease: 'power3.out' }, H0 + 0.25);
    tl.fromTo(refEl.querySelectorAll('.r2'), { opacity: 0 }, { opacity: 1, duration: 0.3, stagger: 0.2 }, H0 + 0.45);

    // 4 · HEAD expands into the intro
    const E0 = H0 + 1.6;
    tl.to(refEl, { autoAlpha: 0, y: cy + 12, duration: 0.35 }, E0);
    tl.set(out, { autoAlpha: 1 }, E0);
    gsap.set(avatar, { opacity: 0 });
    tl.to(
      head,
      { x: ar.left - sr.left + aw / 2, y: ar.top - sr.top + aw / 2, scale: 1, duration: 1, ease: 'power3.inOut' },
      E0,
    );
    tl.to(head, { '--glow': 0, duration: 0.7 }, E0 + 0.1);
    tl.to(head.querySelector('img'), { opacity: 1, duration: 0.5 }, E0 + 0.45);
    tl.set(avatar, { opacity: 1 }, E0 + 1);
    tl.set(head, { autoAlpha: 0 }, E0 + 1);
    tl.fromTo(out.querySelectorAll('.ch'), { yPercent: 110 }, { yPercent: 0, duration: 0.7, stagger: 0.03, ease: 'power3.out' }, E0 + 0.6);
    tl.fromTo(
      out.querySelectorAll('.rise'),
      { opacity: 0, y: 24, filter: 'blur(6px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, stagger: 0.12, ease: 'power3.out' },
      E0 + 1,
    );
    tl.to({}, { duration: 1 }, E0 + 1.9);
  }

  onMount(() => scene(build));
</script>

<section class="hero" bind:this={root} aria-label="Introduction">
  <div class="stage" bind:this={stage}>
    <div class="graph" class:vert={view.vert} bind:this={graph} aria-hidden="true">
      <svg width={view.w} height={view.h} viewBox="0 0 {view.w || 1} {view.h || 1}">
        {#each view.paths as p}<path class="ghost" d={p.d} />{/each}
        {#each view.paths as p}
          <path class="ink {p.kind}" data-b={p.b} data-kind={p.kind} d={p.d} pathLength="1" style:--c={B[p.b].color} />
        {/each}
        {#each view.mdots as m}<circle class="ring" cx={m.x} cy={m.y} r="5" style:--c={B[m.b].color} />{/each}
        <circle class="burst" cx={view.w / 2} cy={view.h / 2} r="10" opacity="0" />
        {#each view.dots as d}
          <circle class="dot" class:root={d.b === 'main'} data-b={d.b} cx={d.x} cy={d.y} r="5.5" style:--c={B[d.b].color} />
        {/each}
        {#each view.mdots as m}<circle class="mdot" cx={m.x} cy={m.y} r="5.5" />{/each}
      </svg>

      {#if view.tag}
        <span class="tag" style:left="{view.tag.x}px" style:top="{view.tag.y}px">main</span>
      {/if}

      {#each view.labels as l}
        <div
          class="lb {l.side}"
          class:merge={l.merge}
          data-b={l.b}
          style:left="{l.x}px"
          style:top="{l.y}px"
          style:--c={B[l.b].color}
          style:max-width={view.vert ? `${view.w - l.x - 12}px` : l.max && `${l.max}px`}
        >
          <div class="lt">
          {#if l.merge}
            Merge branch '<span class="m">{B[l.b].name}</span>'
          {:else if view.vert}
            <span class="h">{l.hash}</span> <span class="m">{l.msg}</span>
          {:else}
            <span class="h">{l.hash}{#if l.tip}&nbsp;<span class="ref">({B[l.b].name})</span>{/if}</span>
            <span class="m">{l.msg}</span>
          {/if}
          </div>
        </div>
      {/each}
    </div>

    <div class="con" bind:this={con} aria-hidden="true">
      <div class="cl">
        <span><b>$</b> git log --graph --all</span><span class="hint">scroll to merge</span>
      </div>
      {#each merges as m}
        <div class="cl">
          <span><b>$</b> git merge <i style:color={B[m.b].color}>{B[m.b].name}</i></span>
          <span class="ok">Merge made by the 'ort' strategy.</span>
        </div>
      {/each}
    </div>

    <div class="head" bind:this={head} aria-hidden="true"><img src="/avatar.webp" alt="" /></div>
    <div class="ref" bind:this={refEl} aria-hidden="true">
      <p class="r1"><span class="hh">{headHash}</span> (<b>HEAD</b> → <i>main</i>)</p>
      <p class="r2 dim">Updating {merges[0].hash}..{headHash}</p>
      <p class="r2">Fast-forward · <em>{files} files changed</em></p>
    </div>

    <div class="out" bind:this={out}>
      <Intro />
    </div>
  </div>
</section>

<style>
  .hero { position: relative; }
  .stage {
    position: relative;
    height: 100svh;
    overflow: hidden;
  }

  .graph { position: absolute; inset: 0; pointer-events: none; visibility: hidden; }
  .graph svg { position: absolute; inset: 0; overflow: visible; }
  path { fill: none; stroke-linejoin: round; }
  .ghost { stroke: var(--line); stroke-width: 1.5; stroke-dasharray: 2 5; }
  .ink { stroke: var(--c); stroke-width: 2.5; }
  .ink.main { stroke-width: 3; }
  .dot { fill: var(--c); stroke: var(--bg); stroke-width: 3; }
  .mdot { fill: var(--bg); stroke: var(--accent); stroke-width: 2.5; }
  .ring { fill: none; stroke: var(--c); stroke-width: 2; }
  .burst { fill: none; stroke: var(--accent); stroke-width: 1.5; }

  .tag {
    position: absolute;
    translate: calc(-100% - 14px) -50%;
    font: 600 0.75rem/1 var(--mono);
    color: var(--accent);
  }
  .vert .tag { translate: -6px calc(-100% - 12px); }

  .lb { position: absolute; }
  .lt {
    font: 400 0.8125rem/1.35 var(--mono);
    color: var(--text);
    white-space: nowrap;
    display: flex;
    flex-direction: column;
  }
  .lb.above { translate: -6px calc(-100% - 10px); }
  .lb.below { translate: -6px 10px; }
  .lb .h { font-size: 0.6875rem; color: var(--faint); }
  .lb .ref { color: var(--c); }
  .lb .m { color: var(--text); white-space: normal; }
  .lb.mid { translate: 0 -50%; }
  .lb.mid .lt {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 0.75rem;
  }
  .lb.mid .m { color: var(--c); white-space: nowrap; }
  .lb.merge { color: var(--faint); }

  .con {
    position: absolute;
    left: 50%;
    bottom: 28px;
    translate: -50% 0;
    width: min(calc(100% - 32px), 620px);
    height: 42px;
    background: var(--panel);
    border: 1px solid var(--line);
    border-radius: 10px;
    box-shadow: 0 20px 60px -24px rgba(0, 0, 0, 0.7);
    font: 400 0.8125rem/1 var(--mono);
    color: var(--text);
    overflow: hidden;
    visibility: hidden;
  }
  .cl {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 0 16px;
    white-space: nowrap;
  }
  .cl b { color: var(--syn-fn); font-weight: 500; margin-right: 4px; }
  .cl i { font-style: normal; }
  .cl .ok { color: var(--syn-str); overflow: hidden; text-overflow: ellipsis; }
  .cl .hint { color: var(--accent); }
  .cl .hint::after { content: ' ↓'; }

  .head {
    --glow: 1;
    position: absolute;
    left: 0;
    top: 0;
    width: 88px;
    height: 88px;
    border-radius: 50%;
    background: var(--accent);
    visibility: hidden;
    box-shadow: 0 0 0 calc(var(--glow) * 30px) rgb(233 168 102 / 0.2);
  }
  .head::before {
    content: '';
    position: absolute;
    inset: -320%;
    border-radius: 50%;
    background: radial-gradient(closest-side, rgb(233 168 102 / 0.45), rgb(233 168 102 / 0.12) 45%, transparent);
    opacity: var(--glow);
    pointer-events: none;
  }
  .head img { position: relative; width: 100%; height: 100%; display: block; border-radius: 50%; opacity: 0; }

  .ref {
    position: absolute;
    left: 0;
    top: 0;
    padding-top: 34px;
    text-align: center;
    font: 400 0.875rem/1.7 var(--mono);
    color: var(--text);
    white-space: nowrap;
    visibility: hidden;
  }
  .ref p { margin: 0; }
  .ref .r1 { font-size: 1rem; margin-bottom: 10px; color: var(--muted); }
  .ref .hh { color: var(--syn-fn); margin-right: 4px; }
  .ref b { color: var(--syn-key); font-weight: 600; }
  .ref i { color: var(--accent); font-style: normal; font-weight: 600; }
  .ref .dim { color: var(--faint); font-size: 0.75rem; }
  .ref em { color: var(--syn-str); font-style: normal; }

  .out {
    position: absolute;
    inset: 0;
    display: grid;
    align-items: center;
    padding: 80px 16px 40px;
  }
  :global(.rm) .stage { height: auto; padding-top: 16px; }
  :global(.rm) .graph, :global(.rm) .con, :global(.rm) .head, :global(.rm) .ref { display: none; }
  :global(.rm) .out { position: static; padding: 72px 16px 24px; }

  @media (max-width: 640px) {
    .out { padding: 64px 16px 16px; }
    .lb.mid .lt { font-size: 0.6875rem; }
    .con { bottom: 14px; height: 36px; font-size: 0.6875rem; }
    .cl { padding: 0 12px; }
    .cl .ok { display: none; }
    .ref { font-size: 0.75rem; }
    .ref .r1 { font-size: 0.875rem; }
  }
</style>
