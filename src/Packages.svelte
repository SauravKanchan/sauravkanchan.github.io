<script>
  import { onMount } from 'svelte';
  import c from './content.json';
  import Icon from './lib/Icon.svelte';
  import Metrics from './lib/Metrics.svelte';
  import { stats } from './lib/stats.svelte.js';
  import { gsap, scene } from './lib/motion.js';
  import { ui } from './lib/ui.svelte.js';

  const fmt = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });
  const cmd = 'npm ls --depth=0';
  const pkg = (n) => n.toLowerCase().replace(/\s+/g, '-');

  let section;

  function build() {
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
    section.querySelectorAll('.pkg').forEach((row) => {
      gsap
        .timeline({ scrollTrigger: { trigger: row, start: 'top 90%', end: 'top 55%', scrub: 0.5 } })
        .fromTo(row.querySelector('.tree'), { opacity: 0, x: -12 }, { opacity: 1, x: 0, ease: 'power2.out' }, 0)
        .fromTo(row.querySelector('.fill'), { scaleX: 0 }, { scaleX: 1, ease: 'none' }, 0)
        .fromTo(
          row.querySelector('.card'),
          { opacity: 0, y: 24, filter: 'blur(6px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', ease: 'power2.out' },
          0.35,
        );
    });
  }

  onMount(() => scene(build));
</script>

<section class="packages" id="projects" bind:this={section}>
  <div class="wrap">
    <h2>Shipped packages</h2>
    <p class="prompt"><span class="ps">~/oss $</span> <span class="typed">{cmd}</span></p>

    <div class="mobile-metrics"><Metrics /></div>

    <ul class="list">
      {#each c.projects as p, i}
        <li class="pkg">
          <span class="tree" aria-hidden="true">{i === c.projects.length - 1 ? '└──' : '├──'}</span>
          <svelte:element this={p.link ? 'a' : 'div'} class="card" href={p.link} target={p.link ? '_blank' : undefined} rel={p.link ? 'noopener' : undefined}>
            <span class="top">
              <span class="name">{pkg(p.name)}</span>
              {#if p.link}<Icon name="arrow" size={16} />{/if}
            </span>
            <span class="kind">{p.kind} <span class="ver">· {p.date}</span></span>
            <span class="desc">{p.description}</span>
            {#if p.repo || p.npm}
              <span class="nums">
                {#if p.repo && stats.repoStars[p.repo] != null}<span>★ {fmt.format(stats.repoStars[p.repo])} stars</span>{/if}
                {#if p.npm && stats.downloads != null}<span>↓ {fmt.format(stats.downloads)} / month</span>{/if}
              </span>
            {/if}
            <i class="bar"><i class="fill"></i></i>
          </svelte:element>
        </li>
      {/each}
    </ul>
    <p class="summary"><b>{c.projects.length} packages</b> · found 0 vulnerabilities</p>
  </div>
</section>

<style>
  .packages { padding: clamp(96px, 16vh, 180px) 0 clamp(64px, 10vh, 120px); }
  .wrap { width: min(calc(100% - 32px), 960px); margin: 0 auto; }
  h2 { margin: 0; font: 600 clamp(2.25rem, 6vw, 4rem)/1.02 var(--sans); letter-spacing: -0.035em; }
  .prompt { margin: 18px 0 0; font: 400 clamp(0.8125rem, 0.75rem + 0.3vw, 1rem)/1.6 var(--mono); }
  .ps { color: var(--syn-key); }
  .typed { display: inline-block; }
  .mobile-metrics { display: none; margin-top: 32px; }
  @media (max-width: 1000px) {
    .mobile-metrics { display: block; }
  }

  .list { list-style: none; padding: 0; margin: clamp(36px, 6vh, 64px) 0 0; display: grid; gap: 14px; }
  .pkg { display: grid; grid-template-columns: 4ch 1fr; gap: 10px; align-items: start; }
  .tree { font: 400 0.875rem/1 var(--mono); color: var(--line-2); padding-top: 26px; }
  .card {
    position: relative;
    display: grid;
    gap: 6px;
    padding: 20px 22px 22px;
    background: var(--panel);
    border: 1px solid var(--line);
    border-radius: 14px;
    color: inherit;
    text-decoration: none;
    overflow: hidden;
    transition: border-color 0.2s;
  }
  a.card:hover { border-color: var(--line-2); }
  .top { display: flex; justify-content: space-between; gap: 12px; align-items: baseline; }
  .top :global(svg) { flex: none; color: var(--faint); transition: color 0.2s, transform 0.25s; }
  a.card:hover .top :global(svg) { color: var(--accent); transform: translate(2px, -2px); }
  .name { font: 500 clamp(1rem, 0.9rem + 0.5vw, 1.25rem)/1.3 var(--mono); color: var(--text); overflow-wrap: anywhere; }
  .ver { color: var(--faint); }
  .kind { font: 400 0.75rem/1.4 var(--mono); color: var(--syn-type); }
  .desc { font: 400 1rem/1.55 var(--sans); color: var(--muted); max-width: 64ch; margin-top: 4px; }
  .nums { display: flex; flex-wrap: wrap; gap: 6px 20px; margin-top: 8px; font: 500 0.8125rem/1.4 var(--mono); color: var(--syn-fn); }
  .bar { position: absolute; left: 0; right: 0; bottom: 0; height: 2px; }
  .fill { display: block; height: 100%; background: var(--accent); opacity: 0.6; transform-origin: left; }
  .summary {
    margin: 24px 0 0;
    font: 400 0.8125rem/1 var(--mono);
    color: var(--muted);
  }
  .summary b { color: var(--text); font-weight: 500; }

  @media (max-width: 640px) {
    .pkg { grid-template-columns: 1fr; }
    .tree { display: none; }
    .card { padding: 18px; }
  }
</style>
