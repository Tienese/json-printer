import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/quiz': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/print-report': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/worksheet': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
