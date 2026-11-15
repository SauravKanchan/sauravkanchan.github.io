<script>
  import { onMount } from 'svelte';
  import c from './content.json';
  import Icon from './lib/Icon.svelte';
  import { gsap, scene } from './lib/motion.js';
  import { ui } from './lib/ui.svelte.js';

  const host = (u) => new URL(u).hostname.replace(/^www\./, '');
  const spec = (u) => {
    const { hostname, pathname } = new URL(u);
    const slug = pathname.split('/').filter(Boolean).at(-1).replace(/-[0-9a-f]{8,}$/, '');
    return `${hostname.replace(/^www\./, '')}/${slug}`;
  };
  const camel = (s) =>
    s
      .replace(/[^A-Za-z0-9 ]/g, '')
      .split(' ')
      .slice(0, 3)
      .map((w, i) => (i ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase()))
      .join('');

  let section;

  function build() {
    gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 50%',
        end: 'bottom 50%',
        onToggle: (s) => s.isActive && (ui.stage = 'modules'),
      },
    });
    section.querySelectorAll('.post').forEach((row) => {
      gsap
        .timeline({ scrollTrigger: { trigger: row, start: 'top 88%', end: 'top 52%', scrub: 0.5 } })
        .fromTo(row.querySelector('.imp'), { opacity: 1, y: 22 }, { opacity: 0.55, y: 0, ease: 'power2.out' }, 0)
        .fromTo(
          row.querySelector('.res'),
          { opacity: 0, y: 18, filter: 'blur(6px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', ease: 'power2.out' },
          0.25,
        )
        .fromTo(row.querySelector('.spin'), { rotate: 0, opacity: 1 }, { rotate: 300, opacity: 0, ease: 'none' }, 0)
        .fromTo(row.querySelector('.ok'), { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1 }, 0.55);
    });
    section.querySelectorAll('.talk').forEach((row) => {
      gsap
        .timeline({ scrollTrigger: { trigger: row, start: 'top 86%', end: 'top 60%', scrub: 0.5 } })
        .fromTo(row.querySelector('.ring'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, autoRound: false, ease: 'none' }, 0)
        .fromTo(row.querySelector('.tick'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, autoRound: false, ease: 'none' }, 0.6)
        .fromTo(row.querySelector('.ttl'), { opacity: 0.3, x: -8 }, { opacity: 1, x: 0 }, 0.2);
    });
    const sum = section.querySelector('.summary');
    gsap.fromTo(
      sum,
      { clipPath: 'inset(0 100% 0 0)' },
      { clipPath: 'inset(0 0% 0 0)', ease: 'steps(28)', scrollTrigger: { trigger: sum, start: 'top 92%', end: 'top 70%', scrub: true } },
    );
  }

  onMount(() => scene(build));
</script>

<section class="modules" id="writing" bind:this={section}>
  <div class="wrap">
    <h2>Writing &amp; talks</h2>

    <h3 class="group"><span>imports</span> Writing</h3>
    <ul class="posts">
      {#each c.blogs as b}
        <li class="post">
          <a href={b.url} target="_blank" rel="noopener">
            <code class="imp">
              <span class="state">
                <svg class="spin" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M8 2a6 6 0 1 1-6 6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /></svg>
                <span class="ok"><Icon name="check" size={14} /></span>
              </span>
              <span class="kw">import</span> {camel(b.title)} <span class="kw">from</span> <span class="str">"{spec(b.url)}"</span>
            </code>
            <span class="res">
              <span class="title">{b.title}<Icon name="arrow" size={16} /></span>
              <span class="desc">{b.description}</span>
              <span class="host">{host(b.url)}</span>
            </span>
          </a>
        </li>
      {/each}
    </ul>

    <h3 class="group"><span>npm test</span> Talks &amp; workshops</h3>
    <ul class="talks">
      {#each c.talks as t}
        <li class="talk">
          <a href={t.url} target="_blank" rel="noopener">
            <svg class="check" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <circle class="ring" cx="12" cy="12" r="10" pathLength="1" />
              <path class="tick" d="m7.5 12.5 3 3 6-7" pathLength="1" />
            </svg>
            <span class="ttl">
              <span class="title">{t.title}</span>
              <span class="desc">{t.subtitle}</span>
            </span>
          </a>
        </li>
      {/each}
    </ul>
    <p class="summary"><b>Tests:</b> {c.talks.length} passed, {c.talks.length} total</p>
  </div>
</section>

<style>
  .modules { padding: clamp(96px, calc(16 * var(--vu, 1vh)), 180px) 0 clamp(64px, calc(10 * var(--vu, 1vh)), 120px); }
  .wrap { width: min(calc(100% - 32px), 960px); margin: 0 auto; }
  h2 { margin: 0; font: 600 clamp(2.25rem, 6vw, 4rem)/1.02 var(--sans); letter-spacing: -0.035em; }
  .group {
    display: flex;
    align-items: baseline;
    gap: 14px;
    margin: clamp(48px, calc(8 * var(--vu, 1vh)), 80px) 0 8px;
    font: 600 1.25rem/1.2 var(--sans);
    letter-spacing: -0.01em;
  }
  .group span { font: 400 0.75rem/1 var(--mono); color: var(--syn-key); }
  ul { list-style: none; padding: 0; margin: 0; }

  .post a, .talk a { display: block; color: inherit; text-decoration: none; }
  .post { border-top: 1px solid var(--line); padding: 22px 0 26px; }
  .imp {
    display: flex;
    align-items: center;
    gap: 6px;
    font: 400 0.75rem/1.5 var(--mono);
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .imp .kw { color: var(--syn-kw); }
  .imp .str { color: var(--syn-str); overflow: hidden; text-overflow: ellipsis; }
  .state { position: relative; width: 14px; height: 14px; flex: none; margin-right: 4px; }
  .state > * { position: absolute; inset: 0; }
  .spin { color: var(--muted); }
  .ok { color: var(--syn-str); display: grid; }
  .res { display: grid; gap: 6px; margin-top: 12px; }
  .title {
    display: inline-flex;
    align-items: baseline;
    gap: 8px;
    font: 500 clamp(1.125rem, 0.95rem + 0.8vw, 1.5rem)/1.3 var(--sans);
    letter-spacing: -0.015em;
    color: var(--text);
  }
  .title :global(svg) { flex: none; color: var(--faint); transition: color 0.2s, transform 0.25s; }
  a:hover .title :global(svg) { color: var(--accent); transform: translate(2px, -2px); }
  .desc { font: 400 1rem/1.5 var(--sans); color: var(--muted); }
  .host { font: 400 0.75rem/1.4 var(--mono); color: var(--faint); }

  .talk { border-top: 1px solid var(--line); }
  .talk a { display: grid; grid-template-columns: 22px 1fr; gap: 16px; padding: 20px 0; align-items: start; }
  .talk .title { font-size: clamp(1.0625rem, 0.95rem + 0.5vw, 1.25rem); }
  .ttl { display: grid; gap: 4px; }
  .check { margin-top: 2px; }
  .check circle, .check path {
    fill: none;
    stroke: var(--syn-str);
    stroke-width: 1.6;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 1;
    stroke-dashoffset: 0;
  }
  .check circle { transform: rotate(-90deg); transform-origin: center; opacity: 0.6; }
  .talk a:hover .title { color: #fff7ec; }
  .summary {
    margin: 0;
    padding-top: 20px;
    border-top: 1px solid var(--line);
    font: 400 0.8125rem/1 var(--mono);
    color: var(--muted);
  }
  :global(.rm) .spin { display: none; }
  .summary b { color: var(--text); font-weight: 500; }
</style>
