<script>
  import { onMount } from 'svelte';
  import c from './content.json';
  import Icon from './lib/Icon.svelte';
  import { gsap, scene } from './lib/motion.js';
  import { ui } from './lib/ui.svelte.js';

  const s = c.socials;
  const handle = (u) => u.replace(/\/$/, '').split('/').at(-1);
  const links = [
    ['email', s.email, `mailto:${s.email}`],
    ['github', handle(s.github), s.github],
    ['linkedin', handle(s.linkedin), s.linkedin],
    ['medium', handle(s.medium), s.medium],
    ['twitter', '@' + handle(s.twitter), s.twitter],
    ['resume', 'Résumé, Google Drive', c.resume],
  ];
  const cmd = 'contact saurav';
  const year = new Date().getFullYear();

  let section, panel;

  function build() {
    const typed = section.querySelector('.typed');
    const cursor = section.querySelector('.prompt .cursor');
    // short screens can't hold the whole panel while pinned, so play it as the section scrolls past instead
    const fits = section.querySelector('.wrap').offsetHeight + 120 < innerHeight;
    gsap
      .timeline({
        scrollTrigger: {
          trigger: section,
          start: fits ? 'top top' : 'top 75%',
          end: () => (fits ? '+=' + innerHeight * 1.5 : 'top 5%'),
          pin: fits,
          scrub: 0.5,
          onToggle: (st) => st.isActive && (ui.stage = 'shell'),
        },
      })
      .fromTo(typed, { '--n': 0 }, { '--n': cmd.length, ease: `steps(${cmd.length})`, duration: 1 }, 0)
      .to(cursor, { autoAlpha: 0, duration: 0.01 }, 1.3)
      .fromTo(
        panel,
        { clipPath: 'inset(0% 0% 100% 0% round 18px)' },
        { clipPath: 'inset(0% 0% 0% 0% round 18px)', duration: 1, ease: 'power3.inOut' },
        1.3,
      )
      .fromTo(
        panel.querySelectorAll('.rise'),
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' },
        1.9,
      )
      .to({}, { duration: 0.4 });
  }

  onMount(() => scene(build));
</script>

<section class="contact" id="contact" bind:this={section}>
  <div class="wrap">
    <h2 class="sr">Contact</h2>
    <p class="prompt" aria-label="contact saurav">
      <span class="ps">~ $</span>
      <span class="typed" style:--n={cmd.length}>{cmd}</span><span class="cursor"></span>
    </p>
    <div class="panel" bind:this={panel}>
      <p class="lead rise">{c.contact}</p>
      <ul class="links">
        {#each links as [k, label, href]}
          <li class="rise">
            <a {href} target={href.startsWith('mailto') ? undefined : '_blank'} rel="noopener">
              <span class="k">{k}</span>
              <span class="v">{label}</span>
              <Icon name="arrow" size={18} />
            </a>
          </li>
        {/each}
      </ul>
    </div>
  </div>
</section>

<footer class="wrap foot">
  <span><b>✓</b> process exited with code 0</span>
  <span>© {year} {c.name}</span>
</footer>

<style>
  .contact { min-height: 100svh; display: grid; align-items: center; padding: 88px 0 48px; }
  .wrap { width: min(calc(100% - 32px), 960px); margin: 0 auto; }
  .sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
  .prompt {
    margin: 0 0 22px;
    font: 500 clamp(1.5rem, 1rem + 2.6vw, 3rem)/1.2 var(--mono);
    letter-spacing: -0.02em;
    display: flex;
    align-items: center;
    gap: 0.5ch;
  }
  .ps { color: var(--syn-key); }
  .typed {
    display: inline-block;
    width: calc(var(--n) * 1ch);
    overflow: hidden;
    white-space: nowrap;
    vertical-align: bottom;
  }
  .cursor {
    display: inline-block;
    width: 0.58em;
    height: 1.1em;
    background: var(--accent);
    border-radius: 2px;
    margin-left: -0.3ch;
    animation: blink 1.1s steps(1) infinite;
  }
  @keyframes blink { 50% { opacity: 0; } }

  .panel {
    background: var(--panel);
    border: 1px solid var(--line);
    border-radius: 18px;
    padding: clamp(24px, 4vw, 44px);
  }
  .lead {
    margin: 0 0 28px;
    max-width: 26ch;
    font: 600 clamp(1.625rem, 1.1rem + 2.2vw, 2.75rem)/1.12 var(--sans);
    letter-spacing: -0.03em;
    text-wrap: balance;
  }
  .links { list-style: none; padding: 0; margin: 0; }
  .links li { border-top: 1px solid var(--line); }
  .links a {
    display: grid;
    grid-template-columns: 9ch 1fr auto;
    gap: 16px;
    align-items: center;
    padding: 16px 0;
    color: var(--text);
    text-decoration: none;
  }
  .k { font: 400 0.8125rem/1 var(--mono); color: var(--syn-kw); }
  .v {
    font: 500 clamp(1rem, 0.85rem + 0.7vw, 1.375rem)/1.3 var(--sans);
    letter-spacing: -0.01em;
    overflow-wrap: anywhere;
  }
  .links a :global(svg) { color: var(--faint); transition: color 0.2s, transform 0.25s; }
  .links a:hover .v { color: var(--accent); }
  .links a:hover :global(svg) { color: var(--accent); transform: translate(2px, -2px); }

  .foot {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 8px 24px;
    padding: 32px 0 48px;
    font: 400 0.75rem/1.5 var(--mono);
    color: var(--muted);
  }
  .foot b { color: var(--syn-str); font-weight: 500; }

  @media (max-width: 640px) {
    .links a { grid-template-columns: 1fr auto; gap: 4px 12px; }
    .k { grid-column: 1 / -1; }
  }
  @media (prefers-reduced-motion: reduce) {
    .cursor { animation: none; }
  }
</style>
