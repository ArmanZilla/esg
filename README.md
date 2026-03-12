# Social Impact Dashboard (ESG - Social)

A full-stack web dashboard for university social KPIs with real-time updates from Excel uploads.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + TailwindCSS + Recharts |
| Backend | FastAPI (Python) + SQLAlchemy |
| Database | SQLite (MVP) |
| Excel | pandas + openpyxl |
| Auth | JWT (admin from env vars) |
| Real-time | SSE + polling fallback |
| Deploy | Docker + docker-compose |

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
API docs: http://localhost:8000/docs

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Dashboard: http://localhost:5173

### Docker (production)
```bash
docker-compose up --build
```
Frontend: http://localhost:3000 | Backend: http://localhost:8000

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ADMIN_USER` | `admin` | Admin username |
| `ADMIN_PASSWORD` | `changeme123` | Admin password |
| `SECRET_KEY` | `super-secret-...` | JWT signing key |
| `DATABASE_URL` | `sqlite:///./social_dashboard.db` | Database connection string |

## Excel Template

Download from Admin Panel or use `sample.xlsx`. Workbook sheets:

| Sheet | Required Columns | Optional Columns |
|-------|-----------------|-----------------|
| meta | year | period, university_name, uploaded_by |
| gender | year, faculty, group_type, male_pct, female_pct | other_pct, women_leadership_pct, pay_gap_pct |
| engagement | year, faculty, satisfaction_pct | nps, club_participation_pct, avg_activities_per_student |
| volunteering | year, faculty, volunteers_students, volunteers_staff, total_hours, projects_count | top_direction |
| esg_courses | year, faculty, courses_count | esg_students_pct, green_program_students |

## Usage

1. Start backend and frontend
2. Go to `/admin` → login (admin / changeme123)
3. Upload `sample.xlsx` → review validation → click **Publish**
4. Public dashboard at `/dashboard` updates automatically

## Project Structure

```
├── backend/
│   ├── main.py              # FastAPI entry point
│   ├── config.py            # Environment config
│   ├── database.py          # SQLAlchemy setup
│   ├── models.py            # ORM models
│   ├── auth.py              # JWT auth
│   ├── excel_parser.py      # Excel validation
│   ├── template_generator.py # Template .xlsx builder
│   ├── events.py            # SSE event manager
│   ├── generate_sample.py   # Demo data generator
│   ├── sample.xlsx          # Demo dataset
│   └── routers/
│       ├── admin.py         # Admin endpoints
│       ├── public.py        # Public API
│       └── realtime.py      # SSE endpoint
├── frontend/
│   └── src/
│       ├── api.ts           # API client
│       ├── context/         # FilterContext
│       ├── hooks/           # useSSE
│       ├── components/      # Layout, FilterBar, KpiCard, etc.
│       └── pages/           # Dashboard + Admin pages
├── docker-compose.yml
└── README.md
```
