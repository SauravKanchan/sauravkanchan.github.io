<script>
  import { onMount } from 'svelte';
  import c from './content.json';
  import Code from './lib/Code.svelte';
  import Icon from './lib/Icon.svelte';
  import { lines } from './lib/code.js';
  import { gsap, scene } from './lib/motion.js';
  import { ui } from './lib/ui.svelte.js';

  const { papers, certifications } = c.achievements;
  const q = (s) => `"${s}"`;
  const src = `import type { Paper } from "@runtime/academia";

// peer-reviewed, then published
export const papers: Paper[] = [
${papers.map((p) => `  { title: ${q(p.title)} },`).join('\n')}
];

export const certified = [
${certifications.map((x) => `  ${q(x)},`).join('\n')}
] as const;`;
  const code = lines(src);

  let section, stage;

  function build() {
    gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => '+=' + innerHeight * 1.4,
        pin: true,
        scrub: 0.5,
        onToggle: (s) => s.isActive && (ui.stage = 'papers'),
      },
    })
      .fromTo(stage, { '--p': 0 }, { '--p': 100, ease: 'none', duration: 1 }, 0.15)
      .to({}, { duration: 0.2 });
  }

  onMount(() => scene(build));
</script>

<section class="research" id="research" bind:this={section}>
  <div class="stage" bind:this={stage}>
    <div class="layer src" aria-hidden="true">
      <p class="file">research.ts</p>
      <Code lines={code} />
    </div>
    <div class="layer out">
      <h2>Papers &amp; certifications</h2>
      <ol class="papers">
        {#each papers as p}
          <li>
            <a href={p.url} target="_blank" rel="noopener">
              <span>{p.title}</span><Icon name="arrow" size={18} />
            </a>
          </li>
        {/each}
      </ol>
      <ul class="certs">
        {#each certifications as x}<li><Icon name="check" />{x}</li>{/each}
      </ul>
    </div>
    <div class="scan" aria-hidden="true"></div>
  </div>
</section>

<style>
  .research {
    min-height: 100svh;
    display: grid;
    align-items: center;
    padding: 88px 0 48px;
  }
  .stage {
    --p: 100;
    position: relative;
    display: grid;
    width: min(calc(100% - 32px), 960px);
    margin: 0 auto;
  }
  /* both layers stretch to the taller one so the clip percentages and the scanline share one height */
  .layer { grid-area: 1 / 1; align-self: stretch; }
  .src {
    --code-size: clamp(0.6875rem, 0.6rem + 0.4vw, 0.875rem);
    clip-path: inset(calc(var(--p) * 1%) 0 0 0);
    color: var(--text);
  }
  .file { margin: 0 0 16px; font: 500 0.75rem/1 var(--mono); color: var(--muted); }
  .out { clip-path: inset(0 0 calc(100% - var(--p) * 1%) 0); }
  .scan {
    position: absolute;
    left: -16px;
    right: -16px;
    top: calc(var(--p) * 1%);
    height: 1px;
    background: var(--accent);
    box-shadow: 0 0 18px 2px rgb(233 168 102 / 0.45);
    opacity: calc(min(var(--p), 100 - var(--p)) * 0.2);
    pointer-events: none;
  }

  h2 {
    margin: 0;
    font: 600 clamp(2.25rem, 6vw, 4rem)/1.02 var(--sans);
    letter-spacing: -0.035em;
  }
  .papers { list-style: none; padding: 0; margin: 40px 0 0; counter-reset: p; }
  .papers li { border-top: 1px solid var(--line); counter-increment: p; }
  .papers a {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 20px;
    align-items: start;
    padding: 22px 0;
    color: var(--text);
    text-decoration: none;
    font: 500 clamp(1.125rem, 0.95rem + 0.8vw, 1.625rem)/1.3 var(--sans);
    letter-spacing: -0.015em;
    text-wrap: pretty;
  }
  .papers a :global(svg) { margin-top: 0.3em; color: var(--faint); transition: color 0.2s, transform 0.25s; }
  .papers a:hover :global(svg) { color: var(--accent); transform: translate(2px, -2px); }
  .papers a:hover span { color: #fff7ec; }
  .certs {
    list-style: none;
    padding: 24px 0 0;
    margin: 0;
    border-top: 1px solid var(--line);
    display: flex;
    flex-wrap: wrap;
    gap: 12px 32px;
  }
  .certs li { display: flex; align-items: center; gap: 8px; font: 400 1rem/1.4 var(--sans); color: var(--muted); }
  .certs :global(svg) { color: var(--syn-str); flex: none; }

  :global(.rm) .src { display: none; }
</style>
