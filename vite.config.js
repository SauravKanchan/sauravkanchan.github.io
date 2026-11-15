import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { readFileSync } from 'node:fs';
import { llmsTxt } from './llms.js';

const render = () => llmsTxt(JSON.parse(readFileSync(new URL('./src/content.json', import.meta.url))));

const llms = {
  name: 'llms-txt',
  configureServer(server) {
    server.middlewares.use('/llms.txt', (_, res) => {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end(render());
    });
  },
  generateBundle() {
    this.emitFile({ type: 'asset', fileName: 'llms.txt', source: render() });
  },
};

export default defineConfig({
  plugins: [svelte(), llms],
});
