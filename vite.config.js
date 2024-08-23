import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import fs from 'fs'

const root = resolve(__dirname, 'src');
const outDir = resolve(__dirname, 'dist');
const publicDir = resolve(__dirname, 'public');

export default defineConfig({
  resolve: {
    alias: {
      '@src': root,
      '@assets': resolve(root, 'assets'),
    },
  },
  plugins: [
    react(),
    {
      name: 'manifest-copier',
      generateBundle() {
        const manifestPath = resolve(publicDir, 'manifest.json');
        if (fs.existsSync(manifestPath)) {
          const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
          
          // Update paths in the manifest
          manifest.background.service_worker = 'background.js';
          manifest.action.default_popup = 'index.html';
          manifest.content_scripts[0].js = ['content.js'];
          
          this.emitFile({
            type: 'asset',
            fileName: 'manifest.json',
            source: JSON.stringify(manifest, null, 2)
          });
        }
      }
    }
  ],
  build: {
    outDir,
    sourcemap: process.env.NODE_ENV === 'development',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(root, 'PopUp', 'index.html'),
        background: resolve(root, 'background.ts'),
        content: resolve(root, 'content.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'PopUp/index.html') {
            return 'index.html';
          }
          return '[name].[ext]';
        },
      },
    },
  },
})