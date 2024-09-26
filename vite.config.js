import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import fs from 'fs-extra'
import { rollup } from 'rollup'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import replace from '@rollup/plugin-replace'

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
  publicDir,
  plugins: [
    react(),
    {
      name: 'build-content-script',
      async writeBundle() {
        const contentScriptInput = resolve(__dirname, 'src/content-main.ts');
        const bundle = await rollup({
          input: contentScriptInput,
          plugins: [
            nodeResolve(),
            commonjs(),
            typescript({
              tsconfig: './tsconfig.json',
              module: 'esnext',
            }),
            replace({
              'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
              preventAssignment: true
            })
          ]
        });
        await bundle.write({
          file: resolve(outDir, 'content.js'),
          format: 'iife',
          name: 'content'
        });
        await bundle.close();
      }
    },
    {
      name: 'copy-manifest',
      buildEnd() {
        const manifestPath = resolve(publicDir, 'manifest.json');
        if (fs.existsSync(manifestPath)) {
          fs.copySync(manifestPath, resolve(outDir, 'manifest.json'));
        }
      }
    },
    {
      name: 'copy-icons',
      buildEnd() {
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
      },
      output: {
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
    target: ['chrome116', 'firefox115'],
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
  optimizeDeps: {
    include: ['webextension-polyfill'],
  }
})