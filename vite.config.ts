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
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          // Three.js ecosystem: shared across all 3D viewers
          'vendor-three': ['three'],
          'vendor-r3f': ['@react-three/fiber', '@react-three/drei'],
          // React ecosystem
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // UI library
          'vendor-ui': ['zustand', 'clsx', 'tailwind-merge', 'class-variance-authority']
        }
      }
    }
  }
});
