import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages project sites are served from /<repo-name>/, not /.
// The deploy workflow sets VITE_BASE automatically when it builds.
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  build: { chunkSizeWarningLimit: 1500 },
});
