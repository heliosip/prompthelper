import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { VitePWA } from 'vite-plugin-pwa';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import compression from 'vite-plugin-compression';

export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin']
      }
    }),

    // PWA Configuration
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: "AI Prompt Helper",
        short_name: "PromptHelper",
        description: "AI Prompt Management Tool",
        theme_color: "#4F46E5",
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          { src: "/assets/icons/icon-16.png", sizes: "16x16", type: "image/png" },
          { src: "/assets/icons/icon-32.png", sizes: "32x32", type: "image/png" },
          { src: "/assets/icons/icon-48.png", sizes: "48x48", type: "image/png" },
          { src: "/assets/icons/icon-128.png", sizes: "128x128", type: "image/png" }
        ]
      }
    }),

    // Static Asset Copy
    viteStaticCopy({
      targets: [
        { 
          src: 'src/manifest.json',
          dest: '' 
        },
        { 
          src: 'src/assets/icons/*',
          dest: 'assets/icons' 
        },
        { 
          src: 'src/assets/images/*',
          dest: 'assets/images' 
        },
        { 
          src: 'src/assets/styles/*',
          dest: 'assets/styles' 
        },
        { 
          src: 'src/popup/popup.html',
          dest: '' 
        }
      ]
    }),

    // Compression for production
    ...(mode === 'production'
      ? [
          compression({ algorithm: 'gzip', ext: '.gz' }),
          compression({ algorithm: 'brotliCompress', ext: '.br' })
        ]
      : [])
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'components': path.resolve(__dirname, './src/components'),
      'hooks': path.resolve(__dirname, './src/hooks'),
      'services': path.resolve(__dirname, './src/services'),
      'utils': path.resolve(__dirname, './src/utils'),
      'types': path.resolve(__dirname, './src/types'),
      'assets': path.resolve(__dirname, './src/assets')
    }
  },

  css: {
    modules: {
      localsConvention: 'camelCase'
    },
    preprocessorOptions: {
      less: {
        javascriptEnabled: true
      }
    }
  },

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: mode === 'development',
    minify: mode === 'production' ? 'terser' : false,
    terserOptions: mode === 'production' ? {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    } : undefined,
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, 'src/popup/popup.html'),
        content: path.resolve(__dirname, 'src/content/content.ts'),
        background: path.resolve(__dirname, 'src/background/background.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = (assetInfo.name ?? '').split('.');
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name ?? '')) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (assetInfo.name && /\.css$/i.test(assetInfo.name)) {
            return `assets/styles/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    }
  },

  server: {
    port: 3001,
    strictPort: true,
    watch: {
      ignored: ['**/dist/**']
    }
  },

  optimizeDeps: {
    include: ['@emotion/react', '@emotion/styled', '@mui/material']
  }
}));