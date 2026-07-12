import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Statisches Hosting auf GitHub Pages. Relativer Base-Pfad, damit die App
// unter einem Sub-Pfad (jakob-git-hub.github.io/chemie/) funktioniert.
// outDir = docs -> direkt vom bestehenden deploy.yml als Pages-Artefakt genutzt.
export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: { '@': resolve(__dirname, 'src') }
  },
  build: {
    outDir: 'docs',
    emptyOutDir: true,
    target: 'es2020'
  }
});
