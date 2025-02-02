// vite.config.ts

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { VitePWA } from 'vite-plugin-pwa';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import compression from 'vite-plugin-compression';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),

    // ✅ Static file copy (Ensures manifest, assets, and popup.html are copied)
    viteStaticCopy({
      targets: [
        { src: 'src/manifest.json', dest: '' },
        { src: 'src/assets', dest: 'assets' },
        { src: 'src/popup/popup.html', dest: '' } // ✅ Ensures popup.html is copied
      ],
    }),

    // ✅ Apply compression only in production
    ...(mode === 'production'
      ? [
          compression({ algorithm: 'gzip', threshold: 1024 }),
          compression({ algorithm: 'brotliCompress', threshold: 1024 })
        ]
      : []),

    // ✅ PWA Support (Ensures it doesn't break in non-browser environments)
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: "AI Prompt Helper",
        short_name: "PromptHelper",
        description: "AI Prompt Management Tool",
        theme_color: "#ffffff",
        icons: [
          { src: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512x512.png", sizes: "512x512", type: "image/png" }
        ]
      }
    })
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: mode === 'production' ? false : 'inline',
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, 'src/popup/popup.html'), // ✅ Ensures correct path for popup
        content: path.resolve(__dirname, 'src/content/content.ts'),
        background: path.resolve(__dirname, 'src/background/background.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: { drop_console: true },
      output: { comments: false },
    }
  },
  resolve: {
    alias: {
      // Use "@" as an alias for the "src" directory.
      '@': path.resolve(__dirname, 'src'),
      // Additional aliases for convenience:
      'hooks': path.resolve(__dirname, 'src/hooks'),
      'components': path.resolve(__dirname, 'src/components'),
      'types': path.resolve(__dirname, 'src/types'),
      'database.types': path.resolve(__dirname, 'src/database.types'),
    }
  },
  server: {
    port: 3000,
    strictPort: true,
    open: true,
  }
}));
