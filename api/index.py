"""
Vercel Python Serverless Entrypoint
====================================
Vercel looks for a file in api/ and an ASGI/WSGI callable named `app` or `handler`.

This file:
  1. Resolves the repo root so path-sensitive code (ML model, SQLite) works correctly.
  2. Adds backend/ to sys.path so all existing `app.*` imports work unchanged.
  3. Re-exports the FastAPI `app` object — Vercel detects it automatically.
  4. Pre-initializes tables, demo data, and ML model bundle on cold start.

No application logic lives here. All routes, middleware, and startup logic
remain in backend/app/main.py.
"""
import sys
import os

# ---------------------------------------------------------------------------
# Path setup — must happen before any `app.*` import
# ---------------------------------------------------------------------------

# Repo root: one level above this file (api/index.py -> project root)
_REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# Add backend/ to sys.path so `from app.xxx import ...` resolves correctly
_BACKEND_DIR = os.path.join(_REPO_ROOT, "backend")
if _BACKEND_DIR not in sys.path:
    sys.path.insert(0, _BACKEND_DIR)

# Expose repo root via env var so session.py / predictor.py / train.py resolve
# their relative paths to data/ and models/ correctly in the Vercel environment.
os.environ.setdefault("PROJECT_ROOT", _REPO_ROOT)

# ---------------------------------------------------------------------------
# Import the existing FastAPI application and initialize state
# ---------------------------------------------------------------------------
from app.main import app, init_app_state  # noqa: E402

# Ensure SQLite schema, demo dataset, and ML models are initialized for serverless
init_app_state()

# Vercel's @vercel/python runtime detects either `app` or `handler`.
handler = app
