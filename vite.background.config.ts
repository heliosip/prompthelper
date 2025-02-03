import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: path.resolve(__dirname, 'src/background/background.ts'),
      name: 'background',
      formats: ['iife'],
      fileName: () => 'background.js'
    }
  }
});