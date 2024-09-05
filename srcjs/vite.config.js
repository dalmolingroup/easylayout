import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  base: "www/",
  build: {
    outDir: "../inst/www",
    emptyOutDir: true,
    target: "es2015",
    rollupOptions: {
      output:{
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "assets/[name][extname]",
      }
    },
  },
})
