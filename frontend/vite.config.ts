import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      // Proxy API calls to Spring Boot during development
      '/api': 'http://localhost:8080',
      '/print-report/api': 'http://localhost:8080',
      '/quiz/api': 'http://localhost:8080',
      '/quiz/validate': 'http://localhost:8080',
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  }
})
