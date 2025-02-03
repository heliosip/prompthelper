import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [react(), viteStaticCopy({
    targets: [
      { src: './src/manifest.json', dest: '.', rename: 'manifest.json' },
      { src: './src/assets/icons/*', dest: 'assets/icons' },
      { src: './src/popup/popup.html', dest: '.', rename: 'popup.html' }
    ]
  })],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, 'src') },
      { find: '@/utils', replacement: path.resolve(__dirname, 'src/utils') }
    ]
  },
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: path.resolve(__dirname, 'src/popup/popup.tsx'),
      name: 'popup',
      formats: ['iife'],
      fileName: () => 'popup.js'
    },
    rollupOptions: {
      external: [],
      output: {
        inlineDynamicImports: true,
        globals: {}
      }
    }
  }
});