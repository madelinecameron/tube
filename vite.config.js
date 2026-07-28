import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

// @preact/preset-vite aliases react / react-dom / react/jsx-runtime to preact/compat.
// Source is written as ordinary React; the shipped runtime is ~4KB gzipped instead of ~45KB.
// To go back to real React: drop this plugin, `npm i react react-dom`, and nothing in src/ changes.
export default defineConfig({
  plugins: [preact()],
  publicDir: 'static',
  build: {
    outDir: 'dist',
    target: 'es2022',
    cssCodeSplit: false,
    reportCompressedSize: true
  },
  server: {
    port: 3005,
    proxy: {
      '/api': 'http://localhost:3003'
    }
  }
})
