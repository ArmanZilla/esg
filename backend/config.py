import os
import sys

ADMIN_USER = os.getenv("ADMIN_USER", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "")
SECRET_KEY = os.getenv("SECRET_KEY", "")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./social_dashboard.db")

# CORS: comma-separated list of allowed origins
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]

# Validate critical secrets at startup
if not ADMIN_PASSWORD:
    print("FATAL: ADMIN_PASSWORD environment variable is not set.", file=sys.stderr)
    sys.exit(1)

if not SECRET_KEY or SECRET_KEY == "CHANGE_ME_TO_A_RANDOM_64_CHAR_STRING":
    print("FATAL: SECRET_KEY environment variable is not set or is the placeholder.", file=sys.stderr)
    sys.exit(1)
