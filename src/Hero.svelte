<script>
  import { onMount, flushSync } from 'svelte';
  import c from './content.json';
  import Code from './lib/Code.svelte';
  import Icon from './lib/Icon.svelte';
  import { lines } from './lib/code.js';
  import { gsap, scene, reduce } from './lib/motion.js';
  import Metrics from './lib/Metrics.svelte';
  import { ui } from './lib/ui.svelte.js';

  const a = c.achievements;
  const hacks = c.hackathons.recent.length + c.hackathons.early.length;
  const q = (s) => `"${s}"`;
  const src = `import { Engineer } from "@runtime/people";

// one human, statically typed
const saurav = new Engineer({
  name: ${q(c.name)},
  role: ${q(c.role)},
  at: ${q(c.company)},
  stack: [${c.stack.map(q).join(', ')}],
  experience: [
${c.experience.map((e) => `    { role: ${q(e.role)}, at: ${q(e.company)} },`).join('\n')}
  ],
  achievements: { hackathons: ${hacks}, papers: ${a.papers.length}, oss: ${c.projects.filter((p) => p.npm || p.mine).length} },
  contact: ${q(c.socials.email)},
});

export default saurav.run();`;

  const PROPS = ['name', 'role', 'stack', 'experience', 'achievements', 'contact'];
  const code = lines(src);
  const seen = new Set();
  for (const l of code) {
    const hasNew = l.tokens.some((t) => t.text === 'new');
    for (const t of l.tokens) {
      let id = null;
      if (t.c === 'key' && l.indent === 2 && PROPS.includes(t.text)) id = t.text;
      else if (t.c === 'id' && t.text === 'saurav') id = 'decl';
      else if (hasNew && t.text === 'Engineer') id = 'new';
      if (id && !seen.has(id)) {
        seen.add(id);
        t.ast = id;
      }
    }
  }

  const nodes = [
    { id: 'prog', kind: 'Program', text: 'saurav.ts' },
    { id: 'decl', kind: 'VariableDeclaration', text: 'saurav' },
    { id: 'new', kind: 'NewExpression', text: 'Engineer' },
    { id: 'obj', kind: 'ObjectExpression', text: `{ ${PROPS.length} props }` },
    ...PROPS.map((p) => ({ id: p, kind: 'Property', text: p })),
  ];
  const edges = [['prog', 'decl'], ['decl', 'new'], ['new', 'obj'], ...PROPS.map((p) => ['obj', p])];

  const log = [
    ['cmd', '$ runtime build saurav.ts --target=human'],
    ['dim', `parsed saurav.ts into ${nodes.length} AST nodes`],
    ['ok', `resolved ${c.stack.length} dependencies`],
    ['ok', `linked ${c.experience.length} roles`],
    ['ok', `merged ${hacks} hackathon branches`],
    ['ok', `published ${c.projects.length} packages`],
    ['ok', `indexed ${a.papers.length} papers, ${a.certifications.length} certifications`],
    ['ok', `bundled ${c.blogs.length} posts and ${c.talks.length} talks`],
    ['ok', 'tree-shaken: 0 kB of filler'],
    ['ok', 'fetching live stats from api.github.com, api.npmjs.org'],
    ['done', `built saurav.js · serving on main since ${c.since}`],
  ];

  const words = c.name.split(' ');
  const socials = [
    ['GitHub', c.socials.github],
    ['LinkedIn', c.socials.linkedin],
    ['Medium', c.socials.medium],
    ['Twitter', c.socials.twitter],
  ];

  let root, stage, editor, ast, logEl, out;
  let view = $state({ w: 0, h: 0, paths: [] });

  function layout(W, H) {
    const narrow = W < 640;
    const top = 64;
    const h = H - top - 32;
    const y = (f) => top + h * f;
    const P = {
      prog: { x: W / 2, y: y(0.08) },
      decl: { x: W / 2, y: y(0.27) },
      new: { x: W / 2, y: y(0.45) },
      obj: { x: W / 2, y: y(0.62) },
    };
    const cols = narrow ? 3 : 6;
    const span = Math.min(W - 24, 1000);
    PROPS.forEach((p, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      P[p] = { x: W / 2 - span / 2 + (span * (col + 0.5)) / cols, y: y(narrow ? 0.8 + row * 0.15 : 0.84) };
    });
    return P;
  }

  function build() {
    const sr = stage.getBoundingClientRect();
    const W = sr.width;
    const H = sr.height;
    const P = layout(W, H);
    view = {
      w: W,
      h: H,
      paths: edges.map(([f, t]) => {
        const A = P[f];
        const B = P[t];
        const y1 = A.y + 14;
        const y2 = B.y - 14;
        const m = (y1 + y2) / 2;
        return `M${A.x} ${y1}C${A.x} ${m} ${B.x} ${m} ${B.x} ${y2}`;
      }),
    };

    flushSync();
    const nodeEls = [...ast.querySelectorAll('.node')];
    const paths = ast.querySelectorAll('path');
    const kinds = ast.querySelectorAll('.kind');
    const chip = ast.querySelector('.chip');
    const tokens = editor.querySelectorAll('[data-ast]');

    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut', duration: 1 },
      scrollTrigger: {
        trigger: root,
        start: 'top top',
        end: () => '+=' + innerHeight * 4.5,
        pin: true,
        scrub: 0.6,
        onUpdate: (s) => {
          const p = s.progress;
          ui.stage = p < 0.08 ? 'source' : p < 0.42 ? 'parse' : p < 0.77 ? 'build' : 'run';
        },
      },
    });

    gsap.set(ast, { autoAlpha: 1 });
    gsap.set([logEl, out], { autoAlpha: 0 });
    gsap.set(paths, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(kinds, { opacity: 0 });
    gsap.set(chip, { xPercent: -50, yPercent: -50, x: W / 2, y: H / 2, autoAlpha: 0 });

    tl.to(editor.querySelectorAll('.t:not([data-ast])'), { opacity: 0.22, duration: 0.8 }, 0.1);
    tl.to(tokens, { backgroundColor: 'rgba(233, 168, 102, 0.18)', color: '#f4c28c', duration: 0.8 }, 0.1);

    nodeEls.forEach((el, i) => {
      const to = P[el.dataset.id];
      const tok = editor.querySelector(`[data-ast="${el.dataset.id}"]`);
      let from = to;
      if (tok) {
        const r = tok.getBoundingClientRect();
        from = { x: r.left - sr.left + r.width / 2, y: r.top - sr.top + r.height / 2 };
      }
      gsap.set(el, { xPercent: -50, yPercent: -50, x: from.x, y: from.y, opacity: 0 });
      const narrow = W < 640;
      const at = 1 + i * (narrow ? 0.12 : 0.07);
      tl.to(el, { opacity: 1, duration: tok ? (narrow ? 0.4 : 0.15) : 0.6 }, tok ? at + (narrow ? 0.8 : 0) : 2);
      tl.fromTo(
        el,
        { '--box': 0 },
        { x: to.x, y: to.y, '--box': 1, duration: 1.3, ease: 'power3.inOut' },
        at,
      );
    });

    tl.to(editor, { autoAlpha: 0, filter: 'blur(8px)', scale: 0.97, duration: 1.1 }, 1.5);
    tl.to(paths, { strokeDashoffset: 0, duration: 0.8, stagger: 0.05 }, 2.2);
    tl.to(kinds, { opacity: 1, duration: 0.5, stagger: 0.03 }, 2.4);

    tl.to(nodeEls, { x: W / 2, y: H / 2, scale: 0.3, opacity: 0, duration: 1, ease: 'power3.in', stagger: 0.025 }, 3.8);
    tl.to(ast.querySelector('svg'), { opacity: 0, duration: 0.6 }, 3.8);
    tl.fromTo(chip, { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'power3.out' }, 4.6);
    tl.to(chip, { autoAlpha: 0, y: H / 2 - 60, duration: 0.4 }, 5.3);

    tl.fromTo(logEl, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 5.7);
    tl.fromTo(
      logEl.querySelectorAll('.ll'),
      { opacity: 0, x: -10 },
      { opacity: 1, x: 0, duration: 0.25, stagger: 0.2, ease: 'none' },
      5.9,
    );
    tl.fromTo(logEl.querySelector('.bar i'), { scaleX: 0 }, { scaleX: 1, duration: 2.1, ease: 'none' }, 5.9);
    tl.to(logEl, { autoAlpha: 0, y: -40, filter: 'blur(8px)', duration: 0.8 }, 8.2);

    // pinned at 100svh with overflow hidden: shrink the intro on short phones rather than clip it
    const inner = out.querySelector('.out-inner');
    const room = H - 96;
    gsap.set(inner, { scale: Math.min(1, room / inner.offsetHeight), transformOrigin: '0% 50%' });

    tl.set(out, { autoAlpha: 1 }, 8.5);
    tl.fromTo(out.querySelector('.avatar'), { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out' }, 8.5);
    tl.fromTo(out.querySelectorAll('.ch'), { yPercent: 110 }, { yPercent: 0, duration: 0.7, stagger: 0.03, ease: 'power3.out' }, 8.6);
    tl.fromTo(
      out.querySelectorAll('.rise'),
      { opacity: 0, y: 24, filter: 'blur(6px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, stagger: 0.12, ease: 'power3.out' },
      9.1,
    );
    tl.to({}, { duration: 1 }, 10);
  }

  onMount(() => scene(build));
</script>

<section class="hero" bind:this={root} aria-label="Introduction">
  <div class="stage" bind:this={stage}>
    <div class="editor" bind:this={editor}>
      <div class="tabs">
        <span class="tab">saurav.ts</span>
        <span class="crumbs">src / people / saurav.ts</span>
      </div>
      <div class="pane"><Code lines={code} label="saurav.ts, source" /></div>
      <div class="status">
        <span>TypeScript</span><span class="sep">UTF-8</span>
        <span class="hint">Scroll to compile</span>
      </div>
    </div>

    <div class="ast" bind:this={ast} aria-hidden="true">
      <svg width={view.w} height={view.h} viewBox="0 0 {view.w || 1} {view.h || 1}">
        {#each view.paths as d}<path {d} pathLength="1" />{/each}
      </svg>
      {#each nodes as n}
        <div class="node" data-id={n.id}>
          <span class="kind">{n.kind}</span>
          <span class="txt">{n.text}</span>
        </div>
      {/each}
      <div class="chip">saurav.js <span>1 module · 0 errors</span></div>
    </div>

    <div class="log" bind:this={logEl} aria-hidden="true">
      <div class="log-head"><span>build</span><span class="bar"><i></i></span></div>
      {#each log as [k, text]}
        <div class="ll {k}">
          {#if k === 'ok'}<b>✓</b>{:else if k === 'done'}<b>→</b>{/if}{text}
        </div>
      {/each}
    </div>

    <div class="out" bind:this={out}>
      <div class="out-inner">
        <div class="intro">
        <img class="avatar" src="/avatar.svg" alt="Portrait of {c.name}" width="88" height="88" />
        <h1 class="name" aria-label={c.name}>
          {#each words as w}
            <span class="line" aria-hidden="true">{#each w as ch}<span class="ch">{ch}</span>{/each}</span>
          {/each}
        </h1>
        <p class="badge rise">{c.badge}</p>
        <p class="tagline rise">{c.tagline}</p>
        <div class="actions rise">
          <a class="btn primary" href="mailto:{c.socials.email}"><Icon name="mail" /> Say hello</a>
          <a class="btn" href={c.resume} target="_blank" rel="noopener"><Icon name="doc" /> Résumé</a>
        </div>
        <ul class="socials rise">
          {#each socials as [label, href]}
            <li><a {href} target="_blank" rel="noopener">{label}<Icon name="arrow" size={14} /></a></li>
          {/each}
        </ul>
        <p class="stack rise"><span>stack</span> {c.stack.join(' · ')}</p>
        </div>
        <div class="side rise"><Metrics show={reduce || ui.stage === 'run'} /></div>
      </div>
    </div>
  </div>
</section>

<style>
  .hero { position: relative; }
  .stage {
    position: relative;
    height: 100svh;
    overflow: hidden;
    display: grid;
    place-items: center;
    padding: 72px 16px 24px;
  }

  .editor {
    width: min(100%, 860px);
    max-height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--panel);
    border: 1px solid var(--line);
    border-radius: 14px;
    box-shadow: 0 30px 80px -30px rgba(0, 0, 0, 0.7), 0 2px 6px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    --code-size: clamp(0.6875rem, 0.55rem + 0.55vw, 0.875rem);
  }
  .tabs, .status {
    display: flex;
    align-items: center;
    gap: 16px;
    font: 500 0.75rem/1 var(--mono);
    color: var(--muted);
  }
  .tabs { border-bottom: 1px solid var(--line); }
  .tab {
    padding: 12px 18px;
    color: var(--text);
    background: var(--bg-2);
    border-right: 1px solid var(--line);
    box-shadow: inset 0 -2px 0 var(--accent);
  }
  .crumbs { color: var(--faint); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .pane { padding: 18px 20px 18px 8px; overflow: hidden; }
  .status { border-top: 1px solid var(--line); padding: 9px 18px; font-size: 0.6875rem; }
  .status .hint { margin-left: auto; color: var(--accent); }

  .ast { position: absolute; inset: 0; pointer-events: none; visibility: hidden; }
  .ast svg { position: absolute; inset: 0; overflow: visible; }
  .ast path { fill: none; stroke: var(--line-2); stroke-width: 1.25; }
  .node {
    --box: 1;
    position: absolute;
    left: 0;
    top: 0;
    font: 500 var(--code-size, 0.8125rem) / 1.5 var(--mono);
    --code-size: clamp(0.6875rem, 0.55rem + 0.55vw, 0.875rem);
    color: #f4c28c;
    white-space: nowrap;
    padding: 5px 10px;
    border-radius: 8px;
    background: rgb(36 30 24 / calc(var(--box) * 1));
    border: 1px solid rgb(233 168 102 / calc(var(--box) * 0.35));
    box-shadow: 0 10px 24px -12px rgb(0 0 0 / calc(var(--box) * 0.8));
  }
  .node[data-id='prog'], .node[data-id='obj'] { color: var(--text); }
  .kind {
    position: absolute;
    left: 50%;
    bottom: calc(100% + 4px);
    transform: translateX(-50%);
    font: 500 0.625rem/1 var(--sans);
    letter-spacing: 0.02em;
    color: var(--muted);
  }
  .chip {
    position: absolute;
    left: 0;
    top: 0;
    font: 600 clamp(1.25rem, 3vw, 1.75rem)/1 var(--mono);
    color: var(--text);
    padding: 18px 26px;
    border-radius: 14px;
    background: var(--panel);
    border: 1px solid var(--line-2);
    box-shadow: 0 30px 60px -30px rgba(0, 0, 0, 0.8);
    white-space: nowrap;
    display: flex;
    gap: 14px;
    align-items: baseline;
  }
  .chip span { font: 400 0.75rem/1 var(--mono); color: var(--syn-str); }

  .log {
    position: absolute;
    width: min(calc(100% - 32px), 640px);
    font: 400 clamp(0.75rem, 0.65rem + 0.4vw, 0.9375rem)/1.9 var(--mono);
    color: var(--text);
    background: var(--panel);
    border: 1px solid var(--line);
    border-radius: 14px;
    padding: 18px 22px 22px;
    box-shadow: 0 30px 80px -30px rgba(0, 0, 0, 0.7);
  }
  .log-head {
    display: flex;
    align-items: center;
    gap: 14px;
    color: var(--muted);
    font-size: 0.75rem;
    margin-bottom: 10px;
  }
  .bar { flex: 1; height: 2px; background: var(--line); border-radius: 2px; overflow: hidden; }
  .bar i { display: block; height: 100%; background: var(--accent); transform-origin: left; }
  .ll { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ll b { font-weight: 500; display: inline-block; width: 2ch; }
  .ll.ok b { color: var(--syn-str); }
  .ll.cmd { color: var(--syn-fn); }
  .ll.dim { color: var(--muted); padding-left: 2ch; }
  .ll.done { color: var(--accent); margin-top: 6px; }

  .out {
    position: absolute;
    inset: 0;
    display: grid;
    align-items: center;
    padding: 80px 16px 40px;
  }
  .out-inner {
    width: min(100%, 1120px);
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr minmax(300px, 380px);
    gap: 56px;
    align-items: center;
  }
  .badge {
    display: inline-block;
    margin: 24px 0 0;
    padding: 4px 10px;
    border: 1px solid color-mix(in oklab, var(--syn-type) 40%, transparent);
    border-radius: 999px;
    font: 500 0.75rem/1.4 var(--mono);
    color: var(--syn-type);
  }
  @media (max-width: 1000px) {
    .out-inner { display: block; }
    .side { display: none; }
  }
  .avatar { width: 88px; height: 88px; border-radius: 50%; display: block; margin-bottom: 28px; }
  .name {
    margin: 0;
    font: 600 clamp(3rem, 10.5vw, 6rem)/0.98 var(--sans);
    letter-spacing: -0.04em;
    text-wrap: balance;
  }
  .line { display: inline-block; overflow: clip; padding-bottom: 0.06em; margin-right: 0.22em; vertical-align: top; }
  .ch { display: inline-block; }
  .tagline {
    margin: 16px 0 0;
    max-width: 34ch;
    font: 400 clamp(1.125rem, 1rem + 0.7vw, 1.5rem)/1.45 var(--sans);
    color: var(--muted);
    text-wrap: pretty;
  }
  .actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 36px; }
  .socials {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 22px;
    list-style: none;
    padding: 0;
    margin: 28px 0 0;
  }
  .socials a {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: var(--text);
    text-decoration: none;
    font: 500 0.9375rem/2 var(--sans);
  }
  .socials a :global(svg) { color: var(--faint); transition: color 0.2s, transform 0.2s; }
  .socials a:hover :global(svg) { color: var(--accent); transform: translate(1px, -1px); }
  .stack { margin: 40px 0 0; font: 400 0.75rem/1.7 var(--mono); color: var(--muted); }
  .stack span { color: var(--syn-kw); margin-right: 8px; }

  @media (max-width: 640px) and (max-height: 760px) {
    .avatar { width: 56px; height: 56px; margin-bottom: 16px; }
    .name { font-size: clamp(2.5rem, 13vw, 3rem); }
    .badge { margin-top: 16px; }
    .tagline { margin-top: 12px; font-size: 1.0625rem; }
    .actions { margin-top: 22px; }
    .socials { margin-top: 14px; gap: 2px 18px; }
    .stack { margin-top: 14px; }
  }

  :global(.rm) .stage { height: auto; display: block; padding-top: 88px; }
  :global(.rm) .editor { margin: 0 auto; }
  :global(.rm) .ast, :global(.rm) .log { display: none; }
  :global(.rm) .out { position: static; padding: 72px 0 24px; }

  @media (max-width: 640px) {
    .stage { padding: 64px 12px 16px; }
    .pane { padding: 14px 12px 14px 2px; }
    .avatar { width: 72px; height: 72px; margin-bottom: 22px; }
    .ll { white-space: normal; padding-left: 2ch; text-indent: -2ch; line-height: 1.6; margin-bottom: 4px; }
    .ll.dim { padding-left: 2ch; text-indent: 0; }
    .stack { margin-top: 28px; }
    .out { padding: 64px 16px 16px; }
  }
</style>
