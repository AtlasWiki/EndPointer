import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import fs from 'fs-extra'

const root = resolve(__dirname, 'src');
const outDir = resolve(__dirname, 'dist');
const publicDir = resolve(__dirname, 'public');

const getFeatureDirectories = () => {
  return fs.readdirSync(root, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && dirent.name !== 'components')
    .map(dirent => dirent.name);
};

export default defineConfig({
  root,
  publicDir,  // Ensure publicDir is correctly defined
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
          
          // Update paths in manifest
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
            manifest.devtools_page = 'DevTool/DevTool.html';
          }
          
          this.emitFile({
            type: 'asset',
            fileName: 'manifest.json',
            source: JSON.stringify(manifest, null, 2)
          });
        }

        // Copy all files from the public/icons directory to dist/icons
        fs.copySync(resolve(publicDir, 'icons'), resolve(outDir, 'icons'), { overwrite: true });
      }
    }
  ],
  build: {
    outDir,
    emptyOutDir: true,
    sourcemap: 'inline',
    rollupOptions: {
      input: {
        ...getFeatureDirectories().reduce((acc, feature) => {
          acc[`${feature}/index`] = resolve(__dirname, `src/${feature}/${feature}.html`);
          if (feature === 'DevTool') {
            acc[`${feature}/DevtoolRouter`] = resolve(__dirname, `src/${feature}/DevtoolRouter.tsx`);
          }
          return acc;
        }, {}),
        'background': resolve(__dirname, 'src/background-main.ts'),
        'content': resolve(__dirname, 'src/content-main.ts')
      },
      output: {
        dir: outDir,
        entryFileNames: '[name].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('/');
          const feature = info[0];
          if (getFeatureDirectories().includes(feature)) {
            if (assetInfo.name.endsWith('.html')) {
              return `${feature}/[name][extname]`;
            }
            return `${feature}/assets/[name][extname]`;
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
      'webextension-polyfill': 'webextension-polyfill',
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    __DEV__: process.env.NODE_ENV !== 'production',
    global: 'globeThis',
  },
})
