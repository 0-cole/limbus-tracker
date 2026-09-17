import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

const projectRoot = fs.realpathSync(__dirname);

export default defineConfig({
  plugins: [react()],
  base: './',
  root: path.resolve(projectRoot, 'src'),
  publicDir: path.resolve(projectRoot, 'public'),
  build: {
    outDir: path.resolve(projectRoot, 'dist'),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(projectRoot, 'src'),
    },
  },
  server: {
    port: 5173,
  },
});
