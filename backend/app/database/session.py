import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# Load .env if present
load_dotenv()

FILE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.getenv("PROJECT_ROOT", os.path.abspath(os.path.join(FILE_DIR, "..", "..", "..")))

# Determine writable data directory
# On Vercel / serverless functions, the project directory is read-only, so SQLite is placed in /tmp.
is_serverless = bool(
    os.getenv("VERCEL")
    or os.getenv("VERCEL_ENV")
    or os.getenv("AWS_LAMBDA_FUNCTION_NAME")
    or os.getenv("LAMBDA_TASK_ROOT")
    or os.getenv("NOW_REGION")
)

if os.getenv("DATA_DIR"):
    DATA_DIR = os.getenv("DATA_DIR")
elif is_serverless:
    DATA_DIR = "/tmp"
else:
    local_data_dir = os.path.join(PROJECT_ROOT, "data")
    try:
        os.makedirs(local_data_dir, exist_ok=True)
        # Test writability
        if os.access(local_data_dir, os.W_OK):
            DATA_DIR = local_data_dir
        else:
            DATA_DIR = "/tmp"
    except (OSError, PermissionError):
        DATA_DIR = "/tmp"

try:
    os.makedirs(DATA_DIR, exist_ok=True)
except (OSError, PermissionError):
    DATA_DIR = "/tmp"

DEFAULT_SQLITE_URL = f"sqlite:///{os.path.join(DATA_DIR, 'student_analytics.db')}"
DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_SQLITE_URL)

# Normalize postgres:// to postgresql:// for SQLAlchemy compatibility (e.g. on Render / Heroku)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Connect arguments: only SQLite uses check_same_thread
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
