import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_API_BASE_URL || 'http://localhost:8000';

  return {
    plugins: [react()],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    build: {
      // Warn at 600kB, target modern browsers for smaller bundles
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          // Split large vendor libraries into separate cacheable chunks
          manualChunks(id) {
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('node_modules/recharts')) {
              return 'vendor-charts';
            }
            if (id.includes('node_modules/framer-motion')) {
              return 'vendor-motion';
            }
            if (id.includes('node_modules/@tanstack')) {
              return 'vendor-query';
            }
          },
        },
      },
    },

    server: {
      proxy: {
        // ── FastAPI v1 routes ─────────────────────────────────────────────
        '/api/v1': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
        // ── Convenience shorthands (backward compat) ──────────────────────
        '/api/market': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api\/market/, '/api/v1/market'),
        },
        '/api/news': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api\/news/, '/api/v1/news'),
        },
        // ── Legacy Express fallback ───────────────────────────────────────
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
