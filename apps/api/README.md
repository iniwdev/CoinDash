# CoinDash API — FastAPI Backend

## Quick Start

### 1. Start infrastructure (requires Docker Desktop)
```bash
npm run docker:up
```

### 2. Install Python dependencies
```bash
cd apps/api
pip install -e ".[dev]"
```

### 3. Run database migrations
```bash
cd apps/api
alembic upgrade head
```

### 4. Start the FastAPI server
```bash
# From monorepo root:
npm run dev:fastapi

# Or directly:
cd apps/api
python -m uvicorn src.main:app --reload --port 8000
```

### 5. Verify
- Health: http://localhost:8000/health
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## Environment Variables

Copy `.env.example` to `.env` and fill in values:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL async connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` | Secret key for JWT signing (use a long random string in prod) |
| `GROQ_API_KEY` | Groq API key for AI chat module |
| `COINSTATS_API_KEY` | CoinStats API key for market data |
| `CORS_ORIGINS` | Comma-separated allowed origins |

---

## API Routes

All routes are versioned under `/api/v1/`.

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/auth/signup` | — | Register new user |
| POST | `/api/v1/auth/login` | — | Login, returns JWT |
| GET | `/api/v1/auth/me` | Bearer | Current user profile |
| GET | `/api/v1/market/coins/markets` | — | Live market data |
| GET | `/api/v1/market/coins/{id}/market_chart` | — | 7-day price chart |
| GET | `/api/v1/news/?coin=bitcoin` | — | Aggregated crypto news |
| GET | `/api/v1/portfolio/` | Bearer | Portfolio holdings (stub) |
| GET | `/api/v1/alerts/` | Bearer | Price alerts (stub) |

---

## Project Structure

```
apps/api/
├── src/
│   ├── core/          # Config, security, exceptions, dependencies
│   ├── db/            # SQLAlchemy engine, Redis client, Alembic migrations
│   ├── modules/
│   │   ├── auth/      # Signup, login, JWT auth
│   │   ├── coins/     # Market data proxy (CoinStats + CoinGecko fallback)
│   │   ├── news/      # RSS news aggregation
│   │   ├── portfolio/ # Holdings CRUD (Phase 4.7)
│   │   └── alerts/    # Price alerts (Phase 4.8)
│   └── main.py        # FastAPI app factory
├── tests/             # pytest integration tests
├── alembic.ini
└── pyproject.toml
```

---

## Running Tests

```bash
cd apps/api
pip install aiosqlite pytest pytest-asyncio
pytest tests/ -v
```

---

## Migrations (Alembic)

```bash
# Generate a new migration after model changes
alembic revision --autogenerate -m "description"

# Apply all pending migrations
alembic upgrade head

# Rollback one step
alembic downgrade -1
```

---

## Migration Status (Strangler Fig)

| Route | Legacy (Express :5000) | FastAPI (:8000) | Status |
|---|---|---|---|
| Auth signup/login/me | ✅ | ✅ | FastAPI ready |
| Market data proxy | ✅ | ✅ | FastAPI ready |
| News RSS | ✅ | ✅ | FastAPI ready |
| Portfolio CRUD | ❌ | 🔲 stub | Phase 4.7 |
| Alerts CRUD | ❌ | 🔲 stub | Phase 4.8 |
| AI Chat | ❌ (commented out) | 🔲 | Future phase |
