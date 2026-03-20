# Social Dashboard

## 1. Overview

Social Dashboard is a full-stack web application for tracking and visualizing university-level social ESG (Environmental, Social, Governance) key performance indicators. It supports structured Excel data upload, admin-controlled publishing, real-time frontend updates via SSE, and multilingual UI.

**Purpose:** MVP / demo / academic deployment.  
**Status:** Working, containerized, deployment-ready for an isolated subdomain environment.

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React + TypeScript + Vite | React 18, Vite 5 |
| Backend | FastAPI + SQLAlchemy | FastAPI 0.109, SQLAlchemy 2.0 |
| ASGI Server | Gunicorn + Uvicorn workers | Gunicorn 22, Uvicorn 0.27 |
| Reverse Proxy | Nginx (Alpine) | 1.27 |
| Database | SQLite (WAL mode) | Built-in |
| Containerization | Docker Compose | v2 |

---

## 3. Architecture

```
┌──────────┐        ┌────────────────┐        ┌──────────────┐        ┌────────┐
│  Browser │──:3000─▶│  Nginx  (:80)  │──/api/─▶│ FastAPI      │───────▶│ SQLite │
│          │◀───────│  static + proxy │◀───────│ (:8000)      │◀──────│  (WAL) │
└──────────┘        └────────────────┘        └──────────────┘        └────────┘
```

| Component | Role |
|-----------|------|
| **Nginx** | Serves built React SPA, proxies `/api/` requests to backend, handles gzip and security headers, provides frontend `/health` endpoint |
| **FastAPI** | REST API for admin login, Excel upload/validation, data publishing, public data endpoints, SSE streaming, `/health` endpoint |
| **SQLite** | File-based relational database, persisted in a Docker named volume, WAL mode for better read concurrency |

---

## 4. Project Isolation

This project is designed to run independently with no external shared services:

- **Separate containers** — frontend (Nginx) and backend (FastAPI) run as independent Docker containers.
- **Separate Docker network** — Docker Compose creates an isolated bridge network (`socialdashboard_default`).
- **Separate named volume** — database is stored in a dedicated Docker volume (`socialdashboard_db-data`). No shared database with other projects.
- **No shared services** — no Redis, Kafka, PostgreSQL, or external message broker is required.
- **Independent environment** — each deployment uses its own `.env` file with unique secrets. No cross-project configuration.
- **Port isolation** — only one host port is exposed (default `3000`). Backend is internal only.

---

## 5. Environment Variables

Copy the provided template and set real values before first launch:

```bash
cp .env.example .env
```

> **All secrets must be unique per deployment. Do not commit `.env` to version control.**

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ADMIN_USER` | Yes | `admin` | Admin panel username |
| `ADMIN_PASSWORD` | **Yes** | — | Admin panel password. App refuses to start if missing or placeholder. |
| `SECRET_KEY` | **Yes** | — | JWT signing key (≥ 32 chars). App refuses to start if missing or placeholder. |
| `DATABASE_URL` | No | `sqlite:///./data/social_dashboard.db` | SQLAlchemy database URL |
| `ALLOWED_ORIGINS` | No | `http://localhost:3000` | Comma-separated CORS origins |
| `WEB_CONCURRENCY` | No | `2` | Number of Gunicorn worker processes |
| `DEBUG` | No | `false` | Set `true` to enable `/docs`, `/redoc`, `/openapi.json` |
| `MAX_UPLOAD_SIZE` | No | `20971520` | Maximum upload file size in bytes (20 MB) |

See [`.env.example`](.env.example) for the full template with comments.

---

## 6. Ports and Healthchecks

### Exposed Ports

| Port | Binding | Service | Description |
|------|---------|---------|-------------|
| `3000` | Host → Container `:80` | Nginx (frontend) | Public entry point. Serves SPA and proxies API. |
| `8000` | Internal only | FastAPI (backend) | Not exposed to host by default. |

To expose the backend directly for debugging, uncomment the `ports` section in `docker-compose.yml`.

### Health Endpoints

| URL | Served by | Returns | Purpose |
|-----|-----------|---------|---------|
| `GET http://localhost:3000/health` | Nginx | `{"status":"ok"}` | Frontend container liveness probe |
| `GET http://localhost:3000/api/health` | FastAPI (via Nginx proxy) | `{"status":"ok"}` | Backend container liveness probe through proxy |

Docker Compose uses these internally — the frontend container waits for the backend to become healthy before starting.

---

## 7. Dependencies

### External Services

**None required.** The project uses only SQLite (file-based, bundled) and does not depend on Redis, Kafka, PostgreSQL, or any external service.

### System Requirements

| Requirement | Minimum |
|-------------|---------|
| Docker Engine | ≥ 20.10 |
| Docker Compose | v2 |
| OS | Linux, macOS, or Windows with Docker Desktop |

---

## 8. Running with Docker

### First-Time Setup

```bash
# 1. Clone the repository
git clone https://github.com/ArmanZilla/esg.git
cd esg

# 2. Create environment file
cp .env.example .env
# Edit .env — replace ALL placeholder values with real secrets

# 3. Build and start
docker compose up --build -d

# 4. Verify
docker compose ps
# Both services should show status: healthy / running
```

### Access

| URL | What |
|-----|------|
| `http://localhost:3000` | Dashboard UI |
| `http://localhost:3000/health` | Frontend health |
| `http://localhost:3000/api/health` | Backend health (through proxy) |

---

## 9. Deployment Instructions

### Preparing for Subdomain Deployment

1. Set `ALLOWED_ORIGINS` in `.env` to your production domain (e.g., `https://social.example.com`).
2. Set strong, unique values for `ADMIN_PASSWORD` and `SECRET_KEY`.
3. Keep `DEBUG=false` (default) to disable Swagger/ReDoc.
4. If deploying behind an external reverse proxy (e.g., Caddy, Traefik), map the external port to the container's `3000`.

### Build and Launch

```bash
docker compose up --build -d
```

### Verify Deployment

```bash
docker compose ps                          # both services healthy
curl http://localhost:3000/health           # {"status":"ok"}
curl http://localhost:3000/api/health       # {"status":"ok"}
```

---

## 10. Restart and Rebuild

| Action | Command |
|--------|---------|
| Restart all services | `docker compose restart` |
| Stop all services | `docker compose down` |
| Rebuild and restart | `docker compose up --build -d` |
| Force full rebuild (no cache) | `docker compose build --no-cache && docker compose up -d` |
| View running status | `docker compose ps` |

---

## 11. Logs

Logs are available through Docker Compose:

```bash
# All services
docker compose logs

# Follow in real time
docker compose logs -f

# Backend only
docker compose logs backend

# Last 100 lines
docker compose logs --tail=100
```

**Log rotation** is configured in `docker-compose.yml`:
- Driver: `json-file`
- Max size per log file: `10 MB`
- Max log files retained: `3`

No external log aggregation is configured. Logs are container-local.

---

## 12. Database

### Current Setup

| Property | Value |
|----------|-------|
| Engine | SQLite 3 |
| Journal mode | WAL (Write-Ahead Logging) |
| Location (inside container) | `/app/data/social_dashboard.db` |
| Persistence | Docker named volume `socialdashboard_db-data` |

The database is an isolated, per-project file. It is not shared with any other service or project.

### Backup

```bash
docker compose cp backend:/app/data/social_dashboard.db ./backup.db
docker compose cp backend:/app/data/social_dashboard.db-wal ./backup.db-wal
docker compose cp backend:/app/data/social_dashboard.db-shm ./backup.db-shm
```

### Restore

```bash
docker compose down
docker compose cp ./backup.db backend:/app/data/social_dashboard.db
docker compose up -d
```

### Limitations

SQLite is suitable for this deployment profile but has known constraints:

- Single-writer — only one write transaction at a time (WAL mode helps with concurrent reads).
- Not suitable for horizontal scaling or multi-instance deployment.
- Acceptable for MVP / demo / low-load deployments.

---

## 13. Resource Estimate

All values are practical approximations for this MVP deployment.

### Minimum Requirements

| Resource | Estimate |
|----------|----------|
| CPU | 1 vCPU |
| RAM | 256 MB |
| Disk | 500 MB (images + data) |

### Recommended

| Resource | Estimate |
|----------|----------|
| CPU | 2 vCPU |
| RAM | 512 MB |
| Disk | 1 GB |

Docker images are multi-stage builds based on `python:3.11-slim` and `nginx:1.27-alpine`, keeping total image size under 400 MB.

---

## 14. Load Estimate

This project is designed for **low-load / demo** usage, not high-traffic production.

| Metric | Estimate |
|--------|----------|
| Concurrent users | 5–20 |
| Requests per second (sustained) | 10–50 RPS |
| Max upload frequency | A few uploads per day |
| SSE connections | 5–20 simultaneous |

These are practical estimates for a demo dashboard at a single university or department.

> **Note:** This is not a high-load production architecture. For higher scale, migrate to PostgreSQL, add Redis for rate limiting and SSE pub/sub, and deploy behind a load balancer.

---

## 15. Limitations and Production Notes

| Area | Limitation |
|------|-----------|
| Database | SQLite — single writer, no multi-instance scaling. Acceptable for demo/MVP. |
| Rate limiter | In-memory, per-worker. Not distributed across workers or replicas. |
| SSE manager | In-memory, per-worker. Real-time events only reach clients connected to the same worker process. |
| Authentication | Single admin user (username + password). No multi-user RBAC. |
| TLS | Not handled by the application. Deploy behind a TLS-terminating proxy (Caddy, Traefik, Cloudflare). |
| API docs | Disabled by default (`DEBUG=false`). Set `DEBUG=true` for local development. |
| Log aggregation | Container-local only. No external log shipping configured. |
| Scaling | Single-instance only. For horizontal scaling, migrate to PostgreSQL and Redis. |

---

## 16. Quick Verification Checklist

After deployment, confirm all of the following:

- [ ] `.env` created with unique, non-placeholder secrets
- [ ] `docker compose up --build -d` completed without errors
- [ ] `docker compose ps` shows both services as healthy / running
- [ ] `curl http://localhost:3000/health` returns `{"status":"ok"}`
- [ ] `curl http://localhost:3000/api/health` returns `{"status":"ok"}`
- [ ] Dashboard UI loads in browser at configured port
- [ ] Admin login works with configured credentials
- [ ] `ALLOWED_ORIGINS` matches the deployment domain
- [ ] `DEBUG=false` in production (Swagger/ReDoc disabled)
- [ ] Log rotation is active (`docker compose logs` produces output)

---

## 17. Project Structure

```
├── backend/
│   ├── main.py               # FastAPI entry point
│   ├── config.py             # Environment-driven configuration
│   ├── database.py           # SQLAlchemy engine and session
│   ├── models.py             # ORM models
│   ├── auth.py               # JWT authentication
│   ├── rate_limit.py         # Login rate limiter (in-memory)
│   ├── excel_parser.py       # Excel validation and parsing
│   ├── template_generator.py # Excel template generator
│   ├── events.py             # SSE event manager
│   ├── entrypoint.sh         # Gunicorn entrypoint
│   ├── Dockerfile            # Multi-stage production build
│   ├── .dockerignore
│   └── routers/
│       ├── admin.py          # Admin API (login, upload, publish)
│       ├── public.py         # Public API (dashboard data)
│       └── realtime.py       # SSE streaming endpoint
├── frontend/
│   ├── Dockerfile            # Multi-stage build (Vite → Nginx)
│   ├── nginx.conf            # Reverse proxy and SPA config
│   ├── .dockerignore
│   └── src/                  # React application source
├── docker-compose.yml        # Service orchestration
├── .env.example              # Environment template (safe to commit)
├── .gitignore
├── .dockerignore
└── README.md
```

---

## 18. Summary

This project is a working, containerized MVP dashboard prepared for isolated deployment on a subdomain-oriented shared server. It uses Docker Compose for full isolation, SQLite for a zero-dependency database, and Nginx as a reverse proxy. No external services (Redis, Kafka, PostgreSQL) are required. The project is suitable for demo, academic, and low-load deployment scenarios.
