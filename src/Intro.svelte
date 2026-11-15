<script>
  import c from './content.json';
  import Icon from './lib/Icon.svelte';
  import Metrics from './lib/Metrics.svelte';
  import { hash } from './lib/code.js';
  import { reduce } from './lib/motion.js';
  import { ui } from './lib/ui.svelte.js';

  const words = c.name.split(' ');
  // same hash the hero prints as "(HEAD → main)" right before it expands into this avatar
  const headHash = hash(c.name + c.since);
  const socials = [
    ['GitHub', c.socials.github],
    ['LinkedIn', c.socials.linkedin],
    ['Medium', c.socials.medium],
    ['Twitter', c.socials.twitter],
  ];
</script>

<div class="out-inner">
  <figure class="portrait">
    <span class="orbit rise" aria-hidden="true"><i></i></span>
    <img class="avatar" src="/avatar.webp" alt="Portrait of {c.name}" width="288" height="288" />
    <figcaption class="ref rise" aria-hidden="true">
      <span class="hh">{headHash}</span> (<b>HEAD</b> → <i>main</i>)
    </figcaption>
  </figure>

  <div class="copy">
    <p class="badge rise">{c.badge}</p>
    <h1 class="name" aria-label={c.name}>
      {#each words as w}
        <span class="line" aria-hidden="true">{#each w as ch}<span class="ch">{ch}</span>{/each}</span>
      {/each}
    </h1>
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
    <div class="strip rise"><Metrics show={reduce || ui.stage === 'run'} /></div>
  </div>
</div>

<style>
  .out-inner {
    --av: clamp(220px, 23vw, 300px);
    width: min(100%, 1120px);
    margin: 0 auto;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: clamp(48px, 6vw, 88px);
    align-items: center;
  }

  .portrait {
    position: relative;
    margin: 0;
    padding: calc(var(--av) * 0.1);
  }
  .portrait::before {
    content: '';
    position: absolute;
    inset: -10%;
    border-radius: 50%;
    background: radial-gradient(closest-side, rgb(233 168 102 / 0.16), transparent 75%);
    pointer-events: none;
  }
  .avatar {
    position: relative;
    width: var(--av);
    height: var(--av);
    border-radius: 50%;
    display: block;
    box-shadow:
      0 0 0 1px rgb(233 168 102 / 0.35),
      0 0 0 calc(var(--av) * 0.035) var(--bg),
      0 0 0 calc(var(--av) * 0.035 + 1px) var(--line-2);
  }
  .orbit {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 1px dashed var(--line-2);
    box-shadow: 0 calc(var(--av) * 0.08) calc(var(--av) * 0.25) calc(var(--av) * -0.06) rgb(233 168 102 / 0.22);
  }
  .orbit i {
    position: absolute;
    inset: -1px;
    border-radius: 50%;
    animation: spin 28s linear infinite;
  }
  .orbit i::after {
    content: '';
    position: absolute;
    top: 14.6%;
    left: 14.6%;
    width: 10px;
    height: 10px;
    translate: -50% -50%;
    border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 0 3px var(--bg), 0 0 14px 2px rgb(233 168 102 / 0.6);
  }
  @keyframes spin { to { rotate: 1turn; } }

  .ref {
    position: absolute;
    left: 50%;
    bottom: 0;
    translate: -50% 50%;
    padding: 5px 12px;
    background: var(--panel);
    border: 1px solid var(--line);
    border-radius: 999px;
    font: 400 0.75rem/1.4 var(--mono);
    color: var(--muted);
    white-space: nowrap;
    box-shadow: 0 10px 30px -12px rgba(0, 0, 0, 0.8);
  }
  .ref .hh { color: var(--syn-fn); margin-right: 2px; }
  .ref b { color: var(--syn-key); font-weight: 600; }
  .ref i { color: var(--accent); font-style: normal; font-weight: 600; }

  .badge {
    display: inline-block;
    margin: 0 0 18px;
    padding: 4px 10px;
    border: 1px solid color-mix(in oklab, var(--syn-type) 40%, transparent);
    border-radius: 999px;
    font: 500 0.75rem/1.4 var(--mono);
    color: var(--syn-type);
  }
  .name {
    margin: 0;
    font: 600 clamp(3rem, 7vw, 5.75rem)/0.98 var(--sans);
    letter-spacing: -0.04em;
  }
  .line { display: inline-block; overflow: clip; padding-bottom: 0.06em; margin-right: 0.22em; vertical-align: top; }
  .ch { display: inline-block; }
  .tagline {
    margin: 18px 0 0;
    max-width: 40ch;
    font: 400 clamp(1.0625rem, 0.95rem + 0.55vw, 1.375rem)/1.45 var(--sans);
    color: var(--muted);
    text-wrap: pretty;
  }
  .actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 28px; }
  .socials {
    display: flex;
    flex-wrap: wrap;
    gap: 2px 22px;
    list-style: none;
    padding: 0;
    margin: 20px 0 0;
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
  .stack { margin: 18px 0 0; font: 400 0.75rem/1.7 var(--mono); color: var(--muted); }
  .stack span { color: var(--syn-kw); margin-right: 8px; }

  /* Metrics as a flat strip instead of a card */
  .strip { margin-top: 26px; }
  .strip :global(.metrics) {
    background: none;
    border: 0;
    border-top: 1px solid var(--line);
    border-radius: 0;
    box-shadow: none;
    padding: 16px 0 0;
  }
  .strip :global(.head) { margin-bottom: 10px; font-size: 0.75rem; }
  .strip :global(dl) { display: flex; flex-wrap: wrap; gap: 10px 32px; }
  .strip :global(dd) { font-size: 1.5rem; }
  .strip :global(.push) { margin-top: 10px; padding-top: 0; border: 0; font-size: 0.6875rem; }

  @media (max-width: 860px) {
    .out-inner {
      --av: 132px;
      display: block;
    }
    .portrait { width: fit-content; padding: 12px; margin: 0 0 30px; }
    .portrait::before { display: none; }
    .ref { font-size: 0.6875rem; padding: 3px 10px; left: 100%; bottom: 50%; translate: 4px 50%; }
    .badge { margin-bottom: 14px; }
    .name { font-size: clamp(2.5rem, 12vw, 3.5rem); }
    .strip :global(dl) { display: grid; grid-template-columns: repeat(3, auto); gap: 8px 18px; justify-content: start; }
    .strip :global(dd) { font-size: 1.25rem; }
    .strip :global(.push) { display: none; }
  }

  @media (max-width: 860px) {
    /* .short/.tiny come from the fixed viewport height in motion.js, so toolbar hide/show can't toggle them */
    :global(html.short) .out-inner { --av: 108px; }
    :global(html.short) .portrait { padding: 10px; margin-bottom: 22px; }
    :global(html.short) .badge { margin-bottom: 10px; }
    :global(html.short) .name { font-size: clamp(2.25rem, 12vw, 2.75rem); }
    :global(html.short) .tagline { margin-top: 12px; font-size: 1rem; }
    :global(html.short) .actions { margin-top: 20px; }
    :global(html.short) .socials { margin-top: 10px; gap: 0 18px; }
    :global(html.short) .stack { margin-top: 10px; }
    :global(html.short) .strip { display: none; }
  }

  @media (max-width: 860px) {
    :global(html.tiny) .out-inner { --av: 72px; }
    :global(html.tiny) .portrait { padding: 8px; margin-bottom: 14px; }
    :global(html.tiny) .name { font-size: 2.25rem; }
    :global(html.tiny) .tagline { font-size: 0.9375rem; }
    :global(html.tiny) .actions { margin-top: 16px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .orbit i { animation: none; }
  }
</style>
