# saurav.tech

Personal site, built with Svelte 5 + Vite. A person, compiled from source.

```sh
npm install
npm run dev     # http://localhost:5173
npm run build   # -> dist/
```

- All content lives in `src/content.json`.
- GitHub and npm numbers are fetched live in the browser (`src/lib/stats.svelte.js`), falling back to the figures in `content.json`.
- `llms.txt` is generated from `content.json` at build time (`llms.js`); `robots.txt` is in `public/`.
- Replace `public/avatar.svg` to change the portrait.
- Pushing to `master` builds and publishes to the `gh-pages` branch (`.github/workflows/deploy.yml`), which GitHub Pages serves at saurav.tech.
