# Social Impact Dashboard (ESG — Social)

A full-stack web dashboard for university social ESG KPIs with real-time updates, Excel uploads, and admin controls.

---

## Architecture

```
┌──────────┐      ┌──────────────┐      ┌──────────────┐      ┌────────┐
│  Browser │─────▶│  Nginx (:80) │─────▶│  FastAPI      │─────▶│ SQLite │
│          │◀─────│  (frontend)  │◀─────│  (:8000)      │◀─────│  (WAL) │
└──────────┘      └──────────────┘      └──────────────┘      └────────┘
                       ▲                      ▲
                  static files          /api proxy
                  SPA fallback          /health
```

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Reverse Proxy | Nginx 1.27 (Alpine) |
| Backend | FastAPI + Gunicorn + Uvicorn workers |
| Database | SQLite with WAL mode |
| Container | Docker Compose (multi-stage builds) |

---

## Quick Start (Docker)

### Prerequisites

- Docker Engine ≥ 20.10
- Docker Compose v2

### 1. Create environment file

```bash
cp .env.example .env
# Edit .env — change ALL placeholder values!
```

> **⚠️ WARNING:** You **must** set real values for `ADMIN_PASSWORD` and `SECRET_KEY` before starting the containers. The backend will refuse to start if they remain as placeholders.

### 2. Build and start

```bash
docker compose up --build -d
```

### 3. Access the dashboard

- **Dashboard:** [http://localhost:3000](http://localhost:3000)
- **Admin Panel:** [http://localhost:3000](http://localhost:3000) → Admin login
- **API Docs (debug only):** Uncomment the backend port in `docker-compose.yml`, then visit [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Local Development (without Docker)

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/macOS
pip install -r requirements.txt
# Set environment variables (see below)
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

All variables are loaded from `.env` at the project root.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ADMIN_USER` | Yes | `admin` | Admin panel username |
| `ADMIN_PASSWORD` | **Yes** | — | Admin panel password (no default; app exits if missing) |
| `SECRET_KEY` | **Yes** | — | JWT signing key (no default; app exits if placeholder) |
| `DATABASE_URL` | No | `sqlite:///./data/social_dashboard.db` | SQLAlchemy database URL |
| `ALLOWED_ORIGINS` | No | `http://localhost:3000` | Comma-separated CORS origins |
| `WEB_CONCURRENCY` | No | `2` | Number of Gunicorn worker processes |
| `DEBUG` | No | `false` | Set `true` to enable `/docs`, `/redoc`, `/openapi.json` |
| `MAX_UPLOAD_SIZE` | No | `20971520` | Max upload size in bytes (20 MB) |

See [`.env.example`](.env.example) for a template.

---

## Healthcheck Endpoints

| Endpoint | Served by | Purpose |
|----------|-----------|---------|
| `GET /health` | FastAPI backend | Container liveness / readiness probe |
| `GET /health` | Nginx (frontend) | Frontend container health probe |

Both return `{"status": "ok"}` with HTTP 200.

Docker Compose uses these for orchestration — the frontend container waits for the backend to become healthy before starting.

---

## Admin Authentication

1. `POST /api/admin/login` with `{ "username": "...", "password": "..." }`
2. Returns a JWT `access_token` (valid for 24 hours)
3. All admin endpoints require `Authorization: Bearer <token>`

**Rate limiting:** The login endpoint is rate-limited to **5 failed attempts per IP within 5 minutes**. After that, further attempts return HTTP 429 until the window expires or a successful login resets the counter.

> The rate limiter is in-memory and per-worker — see `backend/rate_limit.py` for details and limitations.

---

## File Upload

1. Admin uploads an Excel file (`.xlsx`) via `POST /api/admin/upload`
2. Backend parses and validates against expected sheet schemas
3. Valid data is stored as a **draft** upload
4. Admin publishes the upload via `POST /api/admin/publish/{upload_id}`
5. Connected frontends receive a real-time SSE notification and reload data

Download the Excel template from the admin panel or see `backend/sample.xlsx`.

---

## SQLite Backup Strategy

The database is persisted in a Docker named volume (`db-data`) at `/app/data/social_dashboard.db`.

### Backup

```bash
# Find the volume mount path
docker compose exec backend ls /app/data/

# Copy the database out of the container
docker compose cp backend:/app/data/social_dashboard.db ./backup_$(date +%Y%m%d).db
```

Because WAL mode is enabled, you should also copy the `-wal` and `-shm` files:

```bash
docker compose cp backend:/app/data/social_dashboard.db-wal ./backup_$(date +%Y%m%d).db-wal
docker compose cp backend:/app/data/social_dashboard.db-shm ./backup_$(date +%Y%m%d).db-shm
```

### Restore

```bash
docker compose down
docker compose cp ./backup_20250101.db backend:/app/data/social_dashboard.db
docker compose up -d
```

---

## Security Notes

- **No default secrets.** `ADMIN_PASSWORD` and `SECRET_KEY` must be set; the app refuses to start otherwise.
- **Non-root container.** The backend runs as `appuser` (UID 1000).
- **Rate limiting.** Login brute-force is throttled (5 attempts / 5 min per IP).
- **Security headers.** Nginx sets `X-Frame-Options`, `X-Content-Type-Options`, and `Referrer-Policy`.
- **Upload size limit.** `client_max_body_size 20M` prevents oversized uploads.
- **CORS.** Controlled via `ALLOWED_ORIGINS` — never use `*` in production.
- **`.env` is git-ignored.** Secrets never enter version control.

---

## Known Limitations

| Area | Limitation |
|------|-----------|
| Database | SQLite — single writer, no multi-instance scaling. Fine for MVP. |
| Rate limiter | In-memory, per-worker. Not distributed across workers or replicas. |
| SSE manager | In-memory, per-worker. Real-time events only reach clients connected to the same worker. |
| Auth | Single admin user only (no multi-user RBAC). |
| TLS | Not handled — deploy behind a TLS-terminating load balancer or use Cloudflare. |
| Logs | Container logs only (json-file driver, 10 MB × 3 rotation). No external log aggregation. |
| Docs | `/docs` and `/redoc` are disabled by default. Set `DEBUG=true` to enable. |

> **Scaling note:** For multi-instance / horizontal scaling, migrate to PostgreSQL for the database and Redis for rate limiting + SSE pub/sub. The SQLAlchemy ORM layer and all models remain unchanged — only `DATABASE_URL` needs to change.

---

## Pre-Deploy Checklist

- [ ] Copy `.env.example` → `.env` and set **real** values
- [ ] Verify `ADMIN_PASSWORD` is strong (16+ chars, mixed case, numbers, symbols)
- [ ] Verify `SECRET_KEY` is random (≥ 32 chars — use `openssl rand -hex 32`)
- [ ] Set `ALLOWED_ORIGINS` to your production domain(s)
- [ ] Run `docker compose up --build -d`
- [ ] Verify `docker compose ps` shows both services as `healthy`
- [ ] Test login at `https://yourdomain.com`
- [ ] Set up TLS termination (reverse proxy, Cloudflare, etc.)
- [ ] Set up a cron job or script for periodic SQLite backups
- [ ] Review `WEB_CONCURRENCY` — set based on available CPU cores
- [ ] Keep `DEBUG=false` in production (disables Swagger/ReDoc)
- [ ] Verify CORS `ALLOWED_ORIGINS` matches your domain exactly

---

## Project Structure

```
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Environment-driven config + validation
│   ├── database.py          # SQLAlchemy engine + session factory
│   ├── models.py            # ORM models (Upload, Metrics, Settings)
│   ├── auth.py              # JWT auth + password hashing
│   ├── rate_limit.py        # Login rate limiter (in-memory)
│   ├── excel_parser.py      # Excel validation + parsing
│   ├── template_generator.py # Excel template generator
│   ├── events.py            # SSE event manager
│   ├── entrypoint.sh        # Container entrypoint (gunicorn)
│   ├── Dockerfile           # Multi-stage production build
│   └── routers/
│       ├── admin.py         # Admin API (login, upload, publish)
│       ├── public.py        # Public API (dashboard data)
│       └── realtime.py      # SSE streaming endpoint
├── frontend/
│   ├── Dockerfile           # Multi-stage build (Vite → Nginx)
│   ├── nginx.conf           # Reverse proxy + SPA config
│   └── src/                 # React application source
├── docker-compose.yml       # Service orchestration
├── .env.example             # Environment template (safe to commit)
├── .gitignore
├── .dockerignore
└── README.md
```
