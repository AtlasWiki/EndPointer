import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  root: 'src',  // Set src/ as the root directory
  plugins: [react()],
  build: {
    outDir: '../dist',  // Output to dist/ at the project root level
    emptyOutDir: true,  // Ensure dist/ is emptied before each build
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/PopUp/popup.html'),  // Correctly resolve paths relative to the root
        devtools: resolve(__dirname, 'src/DevTool/devtools.html'),
      },
    },
  },
})
