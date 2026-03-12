"""
Social Impact Dashboard — FastAPI entry point.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routers import admin, public, realtime

app = FastAPI(
    title="Social Impact Dashboard API",
    description="ESG Social KPI dashboard with Excel upload and real-time updates",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(admin.router)
app.include_router(public.router)
app.include_router(realtime.router)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/")
def root():
    return {"message": "Social Impact Dashboard API", "docs": "/docs"}
