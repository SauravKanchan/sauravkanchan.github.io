<script>
  import { onMount } from 'svelte';
  import c from '../content.json';
  import Icon from '../lib/Icon.svelte';
  import { hash } from '../lib/code.js';
  import { gsap, scene, reduce } from '../lib/motion.js';
  import Metrics from '../lib/Metrics.svelte';
  import { ui } from '../lib/ui.svelte.js';

  const a = c.achievements;
  const hacks = c.hackathons.recent.length + c.hackathons.early.length;
  const objects =
    c.experience.reduce((s, e) => s + e.bullets.length, 0) +
    c.projects.length + hacks + a.papers.length + a.certifications.length +
    c.blogs.length + c.talks.length + c.stack.length;
  const deltas = c.experience.length + hacks;

  const tree = [
    ['README.md', ''],
    ['experience/', `${c.experience.length} roles`],
    ['hackathons/', `${hacks} events`],
    ['papers/', `${a.papers.length} papers`],
    ['posts/', `${c.blogs.length} posts`],
    ['projects/', `${c.projects.length} projects`],
    ['talks/', `${c.talks.length} talks`],
  ];
  const commits = c.experience.map((e) => ({ h: hash(e.role + e.company), msg: `${e.role} @ ${e.company}` }));

  const cmd = {
    clone: `git clone https://github.com/${c.github}/saurav`,
    cd: 'cd saurav && tree -L 1',
    log: `git log --oneline -n ${commits.length}`,
    dev: 'npm run dev',
  };
  // timeline seconds; the terminal text is a pure function of the scrubbed time T
  const S = {
    clone: 0.2, cloning: 1.3, enumerate: 1.5, count: 2.0, recv: 2.6, resolve: 3.8,
    cd: 4.6, tree: 5.3, log: 6.1, logOut: 6.8, dev: 7.5, devOut: 8.0, ready: 8.3,
  };

  let T = $state(reduce ? 99 : 0);
  const p = (at, d) => Math.min(1, Math.max(0, (T - at) / d));
  const typed = (s, at, d) => s.slice(0, Math.round(s.length * p(at, d)));
  const pct = (at, d) => String(Math.round(100 * p(at, d))).padStart(3, ' ');
  const of = (n, at, d) => Math.round(n * p(at, d));
  const BAR = 18;
  const bar = $derived.by(() => {
    const k = Math.round(BAR * p(S.recv, 1.1));
    return ['█'.repeat(k), '░'.repeat(BAR - k)];
  });

  const words = c.name.split(' ');
  const socials = [
    ['GitHub', c.socials.github],
    ['LinkedIn', c.socials.linkedin],
    ['Medium', c.socials.medium],
    ['Twitter', c.socials.twitter],
  ];

  let root, stage, win, titlebar, body, browser, frame, out;

  // keep the newest line in view, like a real terminal
  $effect(() => {
    T;
    if (body) body.scrollTop = body.scrollHeight;
  });

  const clip = (t, r, b, l, rad) => `inset(${t}px ${r}px ${b}px ${l}px round 0px 0px ${rad}px ${rad}px)`;

  function build() {
    const sr = stage.getBoundingClientRect();
    const W = sr.width;
    const H = sr.height;
    const wr = win.getBoundingClientRect();
    const th = titlebar.offsetHeight;
    // the terminal's content area, in stage coordinates (inside the 1px border)
    const L = wr.left - sr.left + 1;
    const Tp = wr.top - sr.top + th;
    const R = sr.right - wr.right + 1;
    const B = sr.bottom - wr.bottom + 1;
    const bw = W - L - R;
    const bh = H - Tp - B;
    const k = Math.min(bw / W, bh / H);

    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut', duration: 1 },
      onUpdate: () => {
        T = tl.time();
        ui.stage = T < S.cloning ? 'source' : T < S.cd ? 'parse' : T < S.ready ? 'build' : 'run';
      },
      scrollTrigger: {
        trigger: root,
        start: 'top top',
        end: () => '+=' + innerHeight * 4.6,
        pin: true,
        scrub: 0.6,
      },
    });
    T = 0;

    // pinned at 100svh with overflow hidden: shrink the intro on short phones rather than clip it
    const inner = out.querySelector('.out-inner');
    gsap.set(inner, { scale: Math.min(1, (H - 96) / inner.offsetHeight), transformOrigin: '0% 50%' });

    const url = titlebar.querySelector('.url');
    const load = titlebar.querySelector('.load');
    gsap.set(url, { autoAlpha: 0, y: 6 });
    gsap.set(load, { scaleX: 0 });
    gsap.set(browser, { autoAlpha: 0, clipPath: clip(Tp, R, B, L, 13) });
    // the full-size page, shrunk into the terminal's content area
    gsap.set(out, { x: L + (bw - W * k) / 2, y: Tp + (bh - H * k) / 2, scale: k, transformOrigin: '0 0' });

    tl.to({}, { duration: S.ready + 0.2 }, 0);

    // the window becomes a browser tab on localhost
    tl.to(titlebar.querySelector('.ttl'), { autoAlpha: 0, y: -6, duration: 0.3 }, 8.6);
    tl.to(url, { autoAlpha: 1, y: 0, duration: 0.3 }, 8.65);
    tl.to(load, { scaleX: 1, duration: 0.6, ease: 'power1.in' }, 8.8);
    tl.to(load, { opacity: 0, duration: 0.15 }, 9.4);
    tl.to(body, { opacity: 0, duration: 0.25 }, 9.2);
    tl.to(browser, { autoAlpha: 1, duration: 0.25 }, 9.25);
    tl.fromTo(out.querySelector('.avatar'), { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' }, 9.3);

    // ...and then maximizes into the page itself: the frame's chrome rides the clip's top edge off screen
    gsap.set(frame, { autoAlpha: 0, top: Tp - th, right: R - 1, bottom: B - 1, left: L - 1, borderRadius: 14 });
    tl.set(win, { autoAlpha: 0 }, 9.6);
    tl.set(frame, { autoAlpha: 1 }, 9.6);
    const max = { duration: 1.4, ease: 'expo.inOut' };
    tl.to(browser, { clipPath: clip(0, 0, 0, 0, 0), ...max }, 9.6);
    tl.to(frame, { top: -th, right: -1, bottom: -1, left: -1, borderRadius: 0, ...max }, 9.6);
    tl.to(out, { x: 0, y: 0, scale: 1, ...max }, 9.6);
    tl.set(frame, { autoAlpha: 0 }, 11);

    tl.fromTo(out.querySelectorAll('.ch'), { yPercent: 110 }, { yPercent: 0, duration: 0.7, stagger: 0.03, ease: 'power3.out' }, 9.5);
    tl.fromTo(
      out.querySelectorAll('.rise'),
      { opacity: 0, y: 24, filter: 'blur(6px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, stagger: 0.1, ease: 'power3.out' },
      10.3,
    );
    tl.to({}, { duration: 1 }, 11.4);
  }

  onMount(() => scene(build));
</script>

{#snippet prompt(dir, branch)}<span class="dir">{dir}</span>{#if branch}<span class="br">{' git:('}<b>main</b>)</span>{/if}<span class="pr">{' ❯ '}</span>{/snippet}
{#snippet chrome()}
  <span class="dots"><i></i><i></i><i></i></span>
  <span class="title">
    <span class="ttl">saurav — zsh</span>
    <span class="url"><Icon name="arrow" size={11} />localhost:5173</span>
  </span>
{/snippet}
{#snippet caret(on)}{#if on}<i class="caret"></i>{/if}{/snippet}

<section class="hero" bind:this={root} aria-label="Introduction">
  <div class="stage" bind:this={stage}>
    <div class="win" bind:this={win} aria-hidden="true">
      <div class="titlebar" bind:this={titlebar}>
        {@render chrome()}
        <i class="load"></i>
      </div>
      <div class="body" bind:this={body}>
        <div class="l">{@render prompt('~')}<span class="cmd">{typed(cmd.clone, S.clone, 1)}</span>{@render caret(T < S.cloning)}</div>
        {#if T < S.clone}<div class="l dim">{'# scroll to run this session'}</div>{/if}
        {#if T >= S.cloning}<div class="l">Cloning into 'saurav'...</div>{/if}
        {#if T >= S.enumerate}
          <div class="l">remote: Enumerating objects: {of(objects, S.enumerate, 0.4)}{#if T >= S.enumerate + 0.4}, done.{/if}</div>
        {/if}
        {#if T >= S.count}
          <div class="l">remote: Counting objects: {pct(S.count, 0.5)}% ({of(objects, S.count, 0.5)}/{objects}){#if T >= S.count + 0.5}, done.{/if}</div>
        {/if}
        {#if T >= S.recv}
          <div class="l">Receiving objects: {pct(S.recv, 1.1)}% ({of(objects, S.recv, 1.1)}/{objects}){#if T >= S.recv + 1.1}, done.{/if}{' '}<span class="bar"><b>{bar[0]}</b>{bar[1]}</span></div>
        {/if}
        {#if T >= S.resolve}
          <div class="l">Resolving deltas: {pct(S.resolve, 0.4)}% ({of(deltas, S.resolve, 0.4)}/{deltas}){#if T >= S.resolve + 0.4}, done.{/if}</div>
        {/if}

        {#if T >= S.cd - 0.2}
          <div class="l gap">{@render prompt('~')}<span class="cmd">{typed(cmd.cd, S.cd, 0.6)}</span>{@render caret(T < S.tree)}</div>
        {/if}
        {#if T >= S.tree}<div class="l dirs">.</div>{/if}
        {#each tree as [f, note], i}
          {#if T >= S.tree + 0.08 * (i + 1)}
            <div class="l"><span class="dim">{i === tree.length - 1 ? '└──' : '├──'}</span> <span class:dirs={f.endsWith('/')}>{f.padEnd(13, ' ')}</span><span class="dim">{note}</span></div>
          {/if}
        {/each}
        {#if T >= S.tree + 0.08 * (tree.length + 1)}
          <div class="l">{'\n'}{tree.length - 1} directories, 1 file</div>
        {/if}

        {#if T >= S.log - 0.2}
          <div class="l gap">{@render prompt('~/saurav', true)}<span class="cmd">{typed(cmd.log, S.log, 0.6)}</span>{@render caret(T < S.logOut)}</div>
        {/if}
        {#each commits as cm, i}
          {#if T >= S.logOut + 0.12 * i}
            <div class="l"><span class="sha">{cm.h}</span>{' '}{#if i === 0}<span class="ref">(<b>{'HEAD -> '}</b><span class="main">main</span>, <span class="origin">origin/main</span>)</span>{' '}{/if}{cm.msg}</div>
          {/if}
        {/each}

        {#if T >= S.dev - 0.2}
          <div class="l gap">{@render prompt('~/saurav', true)}<span class="cmd">{typed(cmd.dev, S.dev, 0.4)}</span>{@render caret(T < S.devOut)}</div>
        {/if}
        {#if T >= S.devOut}<div class="l dim">&gt; saurav dev{'\n'}&gt; vite</div>{/if}
        {#if T >= S.ready}
          <div class="l gap"><span class="ok">{'  ✓ ready'}</span>{' '}<span class="dim">· serving on main since {c.since}</span></div>
          <div class="l">{'  '}<span class="ok">➜</span>{'  Local:   '}<span class="link" class:hot={T >= 8.5}>http://localhost:5173/</span>{@render caret(true)}</div>
        {/if}
      </div>
      <div class="cue" class:gone={T > 0.05}><span>scroll to run</span><i></i></div>
    </div>

    <div class="browser" bind:this={browser}>
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
    <div class="frame" bind:this={frame} aria-hidden="true">
      <div class="titlebar">{@render chrome()}</div>
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

  .win {
    width: min(100%, 780px);
    height: min(100%, 540px);
    display: flex;
    flex-direction: column;
    background: var(--panel);
    border: 1px solid var(--line);
    border-radius: 14px;
    box-shadow: 0 30px 80px -30px rgba(0, 0, 0, 0.7), 0 2px 6px rgba(0, 0, 0, 0.3);
    overflow: hidden;
  }
  .titlebar {
    position: relative;
    flex: none;
    height: 40px;
    display: flex;
    align-items: center;
    padding: 0 14px;
    border-bottom: 1px solid var(--line);
    background: var(--bg-2);
  }
  .dots { display: flex; gap: 7px; }
  .dots i { width: 11px; height: 11px; border-radius: 50%; background: var(--line-2); }
  .dots i:first-child { background: #d9705a; }
  .dots i:nth-child(2) { background: #e0b25a; }
  .dots i:nth-child(3) { background: #8fae6a; }
  .title {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    pointer-events: none;
    font: 500 0.75rem/1 var(--mono);
    color: var(--muted);
  }
  .ttl, .url { grid-area: 1 / 1; }
  .url {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 7px;
    background: var(--panel);
    border: 1px solid var(--line);
    color: var(--text);
  }
  .url :global(svg) { color: var(--syn-str); transform: rotate(45deg); }
  .load {
    position: absolute;
    left: 0;
    right: 0;
    bottom: -1px;
    height: 2px;
    background: var(--accent);
    transform-origin: left;
  }

  .body {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    padding: 16px 20px;
    font: 400 clamp(0.75rem, 0.62rem + 0.45vw, 0.875rem)/1.75 var(--mono);
    color: var(--text);
    mask-image: linear-gradient(transparent, #000 12px);
  }
  .l { white-space: pre-wrap; overflow-wrap: anywhere; min-height: 1.75em; }
  .gap { margin-top: 0.6em; }
  .dir { color: var(--syn-key); }
  .br { color: var(--muted); }
  .br b { color: var(--syn-num); font-weight: 400; }
  .pr { color: var(--accent); }
  .cmd { color: var(--text); }
  .caret {
    display: inline-block;
    width: 0.6em;
    height: 1.15em;
    margin-left: 1px;
    vertical-align: -0.2em;
    background: var(--accent);
    animation: blink 1.1s steps(1) infinite;
  }
  @keyframes blink { 50% { opacity: 0; } }
  .win { position: relative; }
  .cue {
    position: absolute;
    left: 50%;
    bottom: 22px;
    translate: -50% 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    font: 500 0.75rem/1 var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--accent);
    transition: opacity 0.4s, translate 0.4s;
    pointer-events: none;
  }
  .cue i {
    width: 22px;
    height: 34px;
    border: 1.5px solid var(--line-2);
    border-radius: 11px;
    position: relative;
  }
  .cue i::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 7px;
    width: 3px;
    height: 7px;
    margin-left: -1.5px;
    border-radius: 2px;
    background: var(--accent);
    animation: wheel 1.6s ease-in-out infinite;
  }
  @keyframes wheel { 0% { opacity: 0; transform: translateY(-3px); } 30% { opacity: 1; } 80%, 100% { opacity: 0; transform: translateY(10px); } }
  .cue.gone { opacity: 0; translate: -50% 10px; }
  .dim { color: var(--faint); }
  .ok { color: var(--syn-str); }
  .bar { color: var(--line-2); white-space: nowrap; letter-spacing: -0.05em; }
  .bar b { color: var(--accent); font-weight: 400; }
  .dirs { color: var(--syn-type); }
  .sha { color: var(--syn-fn); }
  .ref { color: var(--syn-fn); }
  .ref b { color: var(--syn-key); font-weight: 400; }
  .main { color: var(--syn-str); }
  .origin { color: var(--syn-num); }
  .link { color: var(--syn-key); text-decoration: underline; text-decoration-color: transparent; transition: color 0.2s, text-decoration-color 0.2s; }
  .link.hot { color: var(--accent); text-decoration-color: currentColor; }

  .frame {
    position: absolute;
    visibility: hidden;
    pointer-events: none;
    border: 1px solid var(--line);
    box-shadow: 0 30px 80px -30px rgba(0, 0, 0, 0.7);
    overflow: hidden;
  }
  .frame .ttl { visibility: hidden; }
  .browser {
    position: absolute;
    inset: 0;
    background: var(--bg);
  }

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
  :global(.rm) .win, :global(.rm) .frame { display: none; }
  :global(.rm) .browser, :global(.rm) .out { position: static; }
  :global(.rm) .out { padding: 72px 0 24px; }

  @media (max-width: 640px) {
    .stage { padding: 64px 12px 16px; }
    .body { padding: 12px 14px; }
    .avatar { width: 72px; height: 72px; margin-bottom: 22px; }
    .stack { margin-top: 28px; }
    .out { padding: 64px 16px 16px; }
  }
</style>
