<script>
  import { onMount } from 'svelte';
  import c from './content.json';
  import { gsap, scene } from './lib/motion.js';
  import { ui } from './lib/ui.svelte.js';

  const slug = (s) => s.toLowerCase().replace(/\(.*?\)/g, '').trim().replace(/[^a-z0-9]+/g, '-');
  const groups = [
    ['ETHGlobal', c.hackathons.recent],
    ['2018', c.hackathons.early],
  ];
  const cmd = "git branch --list 'hack/*'";

  let section;

  function build() {
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

  onMount(() => scene(build));
</script>

<section class="hacks" id="hackathons" bind:this={section}>
  <div class="wrap">
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
  .hacks { padding: clamp(64px, 10vh, 120px) 0; }
  .wrap { width: min(calc(100% - 32px), 960px); margin: 0 auto; }
  h2 { margin: 0; font: 600 clamp(2.25rem, 6vw, 4rem)/1.02 var(--sans); letter-spacing: -0.035em; }
  .prompt { margin: 18px 0 0; font: 400 clamp(0.8125rem, 0.75rem + 0.3vw, 1rem)/1.6 var(--mono); }
  .ps { color: var(--syn-key); }
  .typed { display: inline-block; }
  .group {
    margin: clamp(40px, 6vh, 64px) 0 4px;
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
  .branch::before { content: '● '; font-size: 0.625rem; vertical-align: 2px; }
  .event { margin: 0; font: 500 clamp(1.125rem, 1rem + 0.5vw, 1.375rem)/1.3 var(--sans); letter-spacing: -0.015em; color: var(--text); }
  .result { margin: 4px 0 0; font: 400 0.875rem/1.5 var(--mono); color: var(--syn-fn); }
  .result span { color: var(--muted); }

  @media (max-width: 640px) {
    .hack { grid-template-columns: 1fr; }
  }
</style>
