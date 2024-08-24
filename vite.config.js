import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import fs from 'fs'

// Define paths
const root = resolve(__dirname, 'src');
const outDir = resolve(__dirname, 'dist');
const publicDir = resolve(__dirname, 'public');

export default defineConfig({
  // Set the root directory to 'src'
  root,
  plugins: [
    // Add React support
    react(),
    // Custom plugin to modify and copy manifest.json
    {
      name: 'manifest-copier',
      generateBundle() {
        const manifestPath = resolve(publicDir, 'manifest.json');
        if (fs.existsSync(manifestPath)) {
          const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
          
          // Update paths in manifest to match output structure
          if (manifest.action && manifest.action.default_popup) {
            manifest.action.default_popup = 'popup/popup.html';
          }
          if (manifest.background && manifest.background.service_worker) {
            manifest.background.service_worker = 'popup/background.js';
          }
          if (manifest.content_scripts && manifest.content_scripts[0] && manifest.content_scripts[0].js) {
            manifest.content_scripts[0].js = ['popup/content.js'];
          }
          
          // Emit modified manifest.json to output
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
    // Set output directory
    outDir,
    // Clear the output directory before each build
    emptyOutDir: true,
    rollupOptions: {
      // Define entry points
      input: {
        popup: resolve(__dirname, 'src/PopUp/popup.html'),
        background: resolve(__dirname, 'src/PopUp/background.ts'),
        content: resolve(__dirname, 'src/PopUp/content.ts'),
      },
      output: {
        // Set output directory
        dir: outDir,
        // Place JS files in popup subdirectory
        entryFileNames: 'popup/[name].js',
        // Place chunk files in popup subdirectory
        chunkFileNames: 'popup/[name].[hash].js',
        // Configure asset output paths
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'popup.html') {
            return 'popup/[name][extname]';
          }
          return 'popup/assets/[name][extname]';
        },
      },
    },
  },
})