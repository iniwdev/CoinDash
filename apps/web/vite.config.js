import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // ── FastAPI v1 routes (must be ordered BEFORE the legacy catch-all) ──
      '/api/v1': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        // No rewrite needed — path already starts with /api/v1
      },
      // ── Legacy market / news shorthands (kept for backward compat) ────────
      '/api/market': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/market/, '/api/v1/market'),
      },
      '/api/news': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/news/, '/api/v1/news'),
      },
      // ── Legacy Express catch-all (anything not matched above) ─────────────
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
