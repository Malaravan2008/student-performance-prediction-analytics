import os
import json
from fastapi import APIRouter, HTTPException
from app.schemas.metrics import ModelMetricsResponse
from app.ml.train import train_and_evaluate_models, METRICS_FILE
from app.ml.predictor import load_ml_model

router = APIRouter(tags=["Machine Learning"])

@router.post("/train-model", response_model=ModelMetricsResponse)
def train_model():
    """
    Triggers machine learning training pipeline across benchmark models
    (RandomForest, GradientBoosting, LogisticRegression).
    Saves best model and returns empirical performance metrics.
    """
    try:
        metrics = train_and_evaluate_models()
        # Reload active model in memory
        load_ml_model()
        return metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model training failed: {str(e)}")

@router.get("/model-metrics", response_model=ModelMetricsResponse)
def get_model_metrics():
    """
    Returns empirical benchmark metrics, feature importances, and dataset parameters.
    """
    if not os.path.exists(METRICS_FILE):
        # Auto-train if not trained yet
        try:
            metrics = train_and_evaluate_models()
            load_ml_model()
            return metrics
        except Exception as e:
            raise HTTPException(status_code=404, detail="Model metrics not yet available. Train model first.")

    try:
        with open(METRICS_FILE, "r") as f:
            data = json.load(f)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read model metrics: {str(e)}")
