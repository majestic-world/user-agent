import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    target: 'es2022',
    rollupOptions: {
      input: { popup: resolve('popup.html'), options: resolve('options.html'), worker: resolve('src/worker.ts') },
      output: { entryFileNames: chunk => chunk.name === 'worker' ? 'worker.js' : 'assets/[name]-[hash].js' },
    },
  },
});
