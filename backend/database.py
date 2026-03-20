"""
Database engine and session factory.

Current backend: **SQLite** (file-based, persisted via Docker volume).

┌──────────────────────────────────────────────────────────────────────┐
│  SQLite Limitations                                                  │
│  ──────────────────────────────────────────────────────────────────── │
│  • Single-writer: only one write transaction at a time.  WAL mode    │
│    (enabled below) improves read concurrency but writes are still    │
│    serialised.                                                       │
│  • Not suitable for horizontal scaling — every replica would need    │
│    its own copy of the database file.                                │
│  • Best suited for MVP / small deployments with moderate traffic.    │
│                                                                      │
│  Migration path to PostgreSQL                                        │
│  ──────────────────────────────────────────────────────────────────── │
│  1. Change DATABASE_URL to a PostgreSQL DSN:                         │
│       DATABASE_URL=postgresql://user:pass@host:5432/dbname           │
│  2. Remove the `check_same_thread` connect arg (SQLite-only).        │
│  3. Remove the SQLite PRAGMA listener.                               │
│  4. Run `alembic upgrade head` (add Alembic for migrations).         │
│  5. Add `psycopg2-binary` (or `asyncpg`) to requirements.txt.       │
│  The SQLAlchemy ORM layer and all models remain unchanged.           │
└──────────────────────────────────────────────────────────────────────┘
"""
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session
from config import DATABASE_URL

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Enable WAL mode for SQLite (better concurrency)
if "sqlite" in DATABASE_URL:
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


def get_db():
    """FastAPI dependency that yields a DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables and seed default settings."""
    from models import Base, Setting
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing = db.query(Setting).filter(Setting.key == "active_upload_id").first()
        if not existing:
            db.add(Setting(key="active_upload_id", value=""))
            db.commit()
    finally:
        db.close()
