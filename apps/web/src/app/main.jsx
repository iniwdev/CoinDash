import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/lib/queryClient'
import "@/app/index.css";
import "@/styles/shimmer.css";
import App from "@/app/App";
import { AiProvider } from "@/context/AiContext";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

// ── Render free-tier cold start wakeup ───────────────────────────────────────
// Ping the backend immediately on page load so the server starts warming up
// *before* React Query fires its first real data fetch.
// This eliminates the blank screen caused by the 50-second cold start delay.
const apiBase = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')}`
  : '';

fetch(`${apiBase}/health`, { method: 'GET' }).catch(() => {
  // Silently ignore — this is just a wakeup ping, not a critical request
});

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AiProvider>
          <App />
        </AiProvider>
      </ErrorBoundary>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </BrowserRouter>
)
