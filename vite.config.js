import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import fs from 'fs'

const root = resolve(__dirname, 'src');
const outDir = resolve(__dirname, 'dist');
const publicDir = resolve(__dirname, 'public');

export default defineConfig({
  root,
  plugins: [
    react(),
    {
      name: 'html-transform',
      transformIndexHtml(html) {
        return html.replace(/(['"])(.+)\.tsx(['"])/g, '$1$2.js$3');
      }
    },
    {
      name: 'manifest-copier',
      generateBundle() {
        const manifestPath = resolve(publicDir, 'manifest.json');
        if (fs.existsSync(manifestPath)) {
          const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
          
          if (manifest.action && manifest.action.default_popup) {
            manifest.action.default_popup = 'PopUp/popup.html';
          }
          if (manifest.background && manifest.background.service_worker) {
            manifest.background.service_worker = 'background.js';
          }
          if (manifest.content_scripts && manifest.content_scripts[0] && manifest.content_scripts[0].js) {
            manifest.content_scripts[0].js = ['content.js'];
          }
          if (manifest.devtools_page) {
            manifest.devtools_page = 'DevTool/devtool.html';
          }
          
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
    emptyOutDir: true,
    sourcemap: 'inline',
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background-main.ts'),
        content: resolve(__dirname, 'src/content-main.ts'),
        'PopUp/index': resolve(__dirname, 'src/PopUp/popup.html'),
        'PopUp/PopUpRouter': resolve(__dirname, 'src/PopUp/PopUpRouter.tsx'),
        'DevTool/index': resolve(__dirname, 'src/DevTool/devtool.html'),
        'DevTool/DevToolRouter': resolve(__dirname, 'src/DevTool/DevToolRouter.tsx'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'background.js' || assetInfo.name === 'content.js') {
            return '[name][extname]';
          }
          const info = assetInfo.name.split('/');
          const feature = info[0];
          if (['PopUp', 'DevTool'].includes(feature)) {
            return `${feature}/[name][extname]`;
          }
          return 'assets/[name][extname]';
        },
      },
    },
    target: ['chrome89', 'firefox89'],
    minify: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    __DEV__: process.env.NODE_ENV !== 'production',
  },
})