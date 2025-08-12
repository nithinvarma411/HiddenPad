import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './', // <-- This is crucial for Electron to resolve asset paths
  plugins: [react()],
  server: {
    port: 5173,
    open: false // Don't auto-open browser since we're using Electron
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
