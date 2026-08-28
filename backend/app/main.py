import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from app.database.session import Base, engine, SessionLocal
from app.services.data_service import seed_database_and_export_csv
from app.ml.train import train_and_evaluate_models
from app.ml.predictor import load_ml_model

# Routers
from app.routes.auth import router as auth_router
from app.routes.students import router as students_router
from app.routes.predict import router as predict_router
from app.routes.dashboard import router as dashboard_router
from app.routes.alerts import router as alerts_router
from app.routes.recommendations import router as recommendations_router
from app.routes.ml import router as ml_router

FILE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(FILE_DIR, "..", ".."))

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables, Seed Demo Data, Train/Load ML Model
    print("[Startup] Initializing database tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        print("[Startup] Verifying database seeding & CSV dataset...")
        seed_database_and_export_csv(db, PROJECT_ROOT)
    finally:
        db.close()

    # Train or load ML model
    model_path = os.path.join(PROJECT_ROOT, "models", "student_risk_model.joblib")
    if not os.path.exists(model_path):
        print("[Startup] Training initial Machine Learning models...")
        try:
            train_and_evaluate_models()
        except Exception as e:
            print(f"[Startup] Model training warning: {e}")

    load_ml_model()
    print("[Startup] Application initialization complete.")
    yield
    print("[Shutdown] Cleaning up...")

app = FastAPI(
    title="Student Performance Prediction Analytics API",
    description="Early warning and explainable ML analytics platform for student academic risk intervention",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration — read from environment variable
# Set CORS_ORIGINS to a comma-separated list of allowed frontend URLs in production.
# Example: CORS_ORIGINS=https://my-app.vercel.app,http://localhost:3000
_cors_env = os.getenv("CORS_ORIGINS", "*")
if _cors_env.strip() == "*":
    _allow_origins = ["*"]
else:
    _allow_origins = [origin.strip() for origin in _cors_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(auth_router, prefix="/api")
app.include_router(students_router, prefix="/api")
app.include_router(predict_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(alerts_router, prefix="/api")
app.include_router(recommendations_router, prefix="/api")
app.include_router(ml_router, prefix="/api")

@app.get("/")
def root():
    return {
        "status": "online",
        "app": "Student Performance Prediction Analytics",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health():
    return {"status": "healthy"}
