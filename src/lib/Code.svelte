<script>
  let { lines, label = 'source code' } = $props();
</script>

<pre class="code" aria-label={label}><code>{#each lines as l}<span class="ln" style:--ind={l.indent}>{#each l.tokens as t}<span class="t t-{t.c}" data-ast={t.ast}>{t.text}</span>{/each}</span>{/each}</code></pre>

<style>
  .code {
    margin: 0;
    font-family: var(--mono);
    font-size: var(--code-size, 0.875rem);
    line-height: 1.7;
    white-space: pre-wrap;
    word-break: break-word;
    counter-reset: ln;
    tab-size: 2;
    font-variant-ligatures: contextual;
  }
  .ln {
    display: block;
    position: relative;
    min-height: 1.7em;
    padding-left: calc(3.5ch + (var(--ind) + 2) * 1ch);
    text-indent: -2ch;
    counter-increment: ln;
  }
  .ln::before {
    content: counter(ln);
    position: absolute;
    left: 0;
    width: 2ch;
    text-align: right;
    text-indent: 0;
    color: var(--faint);
    font-variant-numeric: tabular-nums;
  }
  .t { border-radius: 3px; }
  .t-kw { color: var(--syn-kw); }
  .t-str { color: var(--syn-str); }
  .t-num { color: var(--syn-num); }
  .t-type { color: var(--syn-type); }
  .t-key { color: var(--syn-key); }
  .t-fn { color: var(--syn-fn); }
  .t-com { color: var(--syn-com); font-style: italic; }
  .t-p { color: var(--muted); }
  .t-id { color: var(--text); }
</style>
