# CoinDash AI — Fintech Intelligence Platform

> A production-grade crypto portfolio and market intelligence dashboard built with React, FastAPI, Redis, and PostgreSQL.

![CoinDash](https://img.shields.io/badge/stack-React%20%2B%20FastAPI-blue?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)
![Build](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)

---

## ✨ Features

| Feature | Description |
|---|---|
| 📈 **Live Market Data** | Real-time prices, sparklines, and 24h changes via CoinGecko |
| 💼 **Portfolio Tracking** | Holdings, P&L, allocation donut, and performance history |
| 👁️ **Smart Watchlist** | Persistent watchlist with live synced market data |
| 🤖 **AI Insights** | Groq-powered LLM market analysis via streaming API |
| 🔐 **JWT Auth** | Secure signup/login with access + refresh token rotation |
| 📰 **News Feed** | Curated crypto news per coin |
| 🔔 **Price Alerts** | Configurable threshold alerts stored per user |
| 🌡️ **Market Heatmap** | Visual sector overview of market momentum |

---

## 🏗️ Architecture

```
coindash/
├── apps/
│   ├── web/          # React + Vite frontend (Tailwind, Zustand, React Query)
│   ├── api/          # FastAPI backend (PostgreSQL, Redis, async SQLAlchemy)
│   └── legacy-api/   # Original Express.js API (retained for reference)
├── docker/           # Docker Compose for local infrastructure
├── docs/             # Architecture diagrams and specs
└── packages/         # Shared utilities (future)
```

### Frontend Stack
- **React 18** + **Vite** — fast HMR dev experience
- **Tailwind CSS** — utility-first styling
- **Zustand** — lightweight global state (auth, watchlist)
- **TanStack Query** — server state, caching, background refetching
- **Framer Motion** — production-grade animations
- **Recharts** — data visualization

### Backend Stack
- **FastAPI** — async Python API with automatic OpenAPI docs
- **PostgreSQL** — primary database (via asyncpg + SQLAlchemy)
- **Redis** — market data caching layer (5-min TTL)
- **Alembic** — database migrations
- **Groq API** — LLM inference for AI Insights
- **JWT** — stateless auth with refresh token rotation

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker Desktop (for PostgreSQL + Redis)

### 1. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/coindash.git
cd coindash
npm install
```

### 2. Start infrastructure

```bash
npm run docker:up
```

### 3. Configure environment

```bash
# Frontend
cp apps/web/.env.example apps/web/.env

# Backend
cp apps/api/.env.example apps/api/.env
# → Fill in DATABASE_URL, REDIS_URL, JWT_SECRET, GROQ_API_KEY
```

### 4. Run database migrations

```bash
cd apps/api
alembic upgrade head
```

### 5. Start development servers

```bash
# Terminal 1 — Frontend (http://localhost:5173)
npm run dev:web

# Terminal 2 — Backend (http://localhost:8000)
npm run dev:fastapi
```

---

## 🌐 Deployment

### Frontend → Vercel

```bash
cd apps/web
# Set VITE_API_BASE_URL to your deployed backend URL in Vercel env settings
vercel deploy --prod
```

### Backend → Railway / Render / Fly.io

```bash
cd apps/api
# Set all env vars from apps/api/.env.example in your platform's dashboard
# Run: alembic upgrade head (one-time via platform console)
```

### Managed Databases
- **PostgreSQL**: [Neon](https://neon.tech) or [Supabase](https://supabase.com)
- **Redis**: [Upstash](https://upstash.com)

---

## 🔑 Environment Variables

### Frontend (`apps/web/.env`)
| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | Yes (prod) | Deployed backend base URL |
| `VITE_COINSTATS_API_KEY` | No | CoinStats key (CoinGecko used by default) |

### Backend (`apps/api/.env`)
| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection string |
| `JWT_SECRET` | Yes | ≥32-char random secret |
| `GROQ_API_KEY` | Optional | Enables AI Insights feature |
| `CORS_ORIGINS` | Yes (prod) | Comma-separated allowed origins |

---

## 📡 API Reference

Full interactive docs available at `http://localhost:8000/docs` when running locally.

Key endpoints:
- `GET /market/coins/markets` — Live coin list (CoinGecko proxy with Redis cache)
- `GET /market/coins/{id}/market_chart` — Historical price data
- `POST /auth/signup` / `POST /auth/login` — Authentication
- `GET /portfolio/{id}/holdings` — Portfolio holdings
- `GET /watchlist` — User watchlist (requires auth)
- `POST /ai/analyze` — AI market analysis

---

## 📁 Project Structure

```
apps/web/src/
├── app/            # App shell, routing
├── components/     # Shared UI components (Navbar, Layout, etc.)
├── features/       # Feature-sliced modules
│   ├── auth/       # Login, signup, session management
│   ├── market-data/# Coins list, detail page, charts
│   ├── portfolio/  # Holdings, P&L, trade modal
│   ├── watchlist/  # Watchlist page + components
│   └── ai-chat/   # Floating AI assistant
├── lib/            # Core utilities (apiClient, normalizeCoin, queryClient)
├── store/          # Zustand stores (auth, watchlist, UI)
└── utils/          # Chart helpers, technical indicators
```

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit: `git commit -m 'feat: add my feature'`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

MIT © 2025 CoinDash AI
