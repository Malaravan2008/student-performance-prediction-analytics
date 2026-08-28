import os
import json
from datetime import datetime
import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

# Navigate to project root
FILE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(FILE_DIR, "..", "..", ".."))

MODELS_DIR = os.path.join(PROJECT_ROOT, "models")
DATA_CSV = os.path.join(PROJECT_ROOT, "data", "students.csv")
os.makedirs(MODELS_DIR, exist_ok=True)

MODEL_FILE = os.path.join(MODELS_DIR, "student_risk_model.joblib")
METRICS_FILE = os.path.join(MODELS_DIR, "model_metrics.json")

FEATURES = [
    "previous_gpa",
    "test_score",
    "attendance_percentage",
    "assignment_completion",
    "lms_login_frequency",
    "class_participation",
    "behavior_score"
]

TARGET = "risk_level"

def train_and_evaluate_models():
    """
    Trains multiple ML classification models on the student dataset, benchmarks them,
    selects the highest-performing model, saves it to disk, and records exact metrics.
    """
    if not os.path.exists(DATA_CSV):
        raise FileNotFoundError(f"Data file not found at {DATA_CSV}. Run seed data generation first.")

    df = pd.read_csv(DATA_CSV)
    
    # Preprocessing
    X = df[FEATURES]
    y = df[TARGET]

    # 80/20 train/test split with stratification
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Candidate Models for benchmarking
    candidates = {
        "RandomForestClassifier": RandomForestClassifier(
            n_estimators=100, max_depth=6, random_state=42
        ),
        "GradientBoostingClassifier": GradientBoostingClassifier(
            n_estimators=80, learning_rate=0.1, max_depth=3, random_state=42
        ),
        "LogisticRegression": LogisticRegression(
            max_iter=1000, random_state=42
        )
    }

    benchmark_results = []
    trained_models = {}
    best_model_name = None
    best_f1 = -1.0

    for name, model in candidates.items():
        # Fit model
        if name == "LogisticRegression":
            model.fit(X_train_scaled, y_train)
            y_pred = model.predict(X_test_scaled)
        else:
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)

        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred, average="weighted", zero_division=0))
        rec = float(recall_score(y_test, y_pred, average="weighted", zero_division=0))
        f1 = float(f1_score(y_test, y_pred, average="weighted", zero_division=0))

        trained_models[name] = model

        benchmark_results.append({
            "model_name": name,
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "is_best": False
        })

        if f1 > best_f1:
            best_f1 = f1
            best_model_name = name

    # Mark the best model
    for b in benchmark_results:
        if b["model_name"] == best_model_name:
            b["is_best"] = True

    best_model = trained_models[best_model_name]

    # Calculate Feature Importances
    feature_importance_dict = {}
    if hasattr(best_model, "feature_importances_"):
        importances = best_model.feature_importances_
        for feat, imp in zip(FEATURES, importances):
            feature_importance_dict[feat] = round(float(imp), 4)
    elif hasattr(best_model, "coef_"):
        # For Logistic Regression, average absolute coefficients across classes
        avg_coef = np.mean(np.abs(best_model.coef_), axis=0)
        norm_coef = avg_coef / np.sum(avg_coef)
        for feat, imp in zip(FEATURES, norm_coef):
            feature_importance_dict[feat] = round(float(imp), 4)
    else:
        for feat in FEATURES:
            feature_importance_dict[feat] = round(1.0 / len(FEATURES), 4)

    # Package and save model bundle
    model_bundle = {
        "model": best_model,
        "model_name": best_model_name,
        "scaler": scaler,
        "features": FEATURES,
        "target_classes": list(best_model.classes_),
        "feature_importance": feature_importance_dict,
        "trained_at": datetime.utcnow().isoformat()
    }
    joblib.dump(model_bundle, MODEL_FILE)

    # Save metrics JSON
    metrics_data = {
        "selected_model": best_model_name,
        "dataset_size": len(df),
        "train_size": len(X_train),
        "test_size": len(X_test),
        "features": FEATURES,
        "target": TARGET,
        "feature_importance": feature_importance_dict,
        "benchmarks": benchmark_results,
        "trained_at": datetime.utcnow().isoformat(),
        "data_source_label": "Prototype Benchmark Dataset (Synthetic Fictional Cohort)"
    }
    with open(METRICS_FILE, "w") as f:
        json.dump(metrics_data, f, indent=2)

    print(f"[ML Train] Best Model: {best_model_name} with F1-Score: {best_f1:.4f}")
    print(f"[ML Train] Saved model to {MODEL_FILE} and metrics to {METRICS_FILE}")
    return metrics_data

if __name__ == "__main__":
    train_and_evaluate_models()
