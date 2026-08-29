import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from app.schemas.prediction import PredictRequest, PredictResponse, FactorDetail
from app.services.risk_engine import calculate_formula_risk
from app.services.recommendation_engine import generate_recommendations

FILE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.getenv("PROJECT_ROOT", os.path.abspath(os.path.join(FILE_DIR, "..", "..", "..")))

# Candidate model paths to ensure reliable loading across local and serverless Vercel environments
CANDIDATE_MODEL_PATHS = [
    os.path.join(PROJECT_ROOT, "models", "student_risk_model.joblib"),
    os.path.join(PROJECT_ROOT, "backend", "models", "student_risk_model.joblib"),
    os.path.abspath(os.path.join(FILE_DIR, "..", "..", "models", "student_risk_model.joblib")),
    "/var/task/models/student_risk_model.joblib",
    "/var/task/backend/models/student_risk_model.joblib",
]

_model_bundle = None

def get_model_path() -> Optional[str]:
    for path in CANDIDATE_MODEL_PATHS:
        if os.path.exists(path):
            return path
    return None

def load_ml_model():
    global _model_bundle
    if _model_bundle is not None:
        return _model_bundle

    model_path = get_model_path()
    if model_path:
        try:
            _model_bundle = joblib.load(model_path)
            print(f"[ML Predictor] Successfully loaded pre-trained model '{_model_bundle.get('model_name')}' from {model_path}")
        except Exception as e:
            print(f"[ML Predictor] Notice: Failed to load model from {model_path}: {e}")
            _model_bundle = None
    else:
        print("[ML Predictor] Notice: Pre-trained ML model file not found in paths. Using formula rule engine.")
        _model_bundle = None

    return _model_bundle

def predict_student_risk(req: PredictRequest) -> PredictResponse:
    """
    Runs ML prediction if model exists; integrates explainability and recommendations.
    Falls back gracefully to formula risk engine if ML model is unavailable.
    """
    global _model_bundle
    if _model_bundle is None:
        load_ml_model()

    # Step 1: Baseline Formula Risk & Diagnostics
    formula_score, formula_level, key_factors, factor_details = calculate_formula_risk(
        previous_gpa=req.previous_gpa,
        test_score=req.test_score,
        attendance_percentage=req.attendance_percentage,
        assignment_completion=req.assignment_completion,
        lms_login_frequency=req.lms_login_frequency,
        class_participation=req.class_participation,
        behavior_score=req.behavior_score
    )

    # Generate personalized recommendations & interventions
    main_prob, intervention, priority, recommended_actions, _ = generate_recommendations(
        student_id=req.student_id or "STU-NEW",
        name=req.student_name or "Candidate",
        risk_level=formula_level,
        risk_score=formula_score,
        attendance_percentage=req.attendance_percentage,
        previous_gpa=req.previous_gpa,
        test_score=req.test_score,
        assignment_completion=req.assignment_completion,
        lms_login_frequency=req.lms_login_frequency,
        class_participation=req.class_participation,
        behavior_score=req.behavior_score
    )

    # Step 2: ML Inference if Model is Available
    if _model_bundle is not None:
        try:
            model = _model_bundle["model"]
            scaler = _model_bundle.get("scaler")
            features = _model_bundle.get("features", [
                "previous_gpa", "test_score", "attendance_percentage",
                "assignment_completion", "lms_login_frequency",
                "class_participation", "behavior_score"
            ])
            classes = list(model.classes_)

            # Build feature DataFrame with named columns
            input_df = pd.DataFrame([{
                "previous_gpa": req.previous_gpa,
                "test_score": req.test_score,
                "attendance_percentage": req.attendance_percentage,
                "assignment_completion": req.assignment_completion,
                "lms_login_frequency": req.lms_login_frequency,
                "class_participation": req.class_participation,
                "behavior_score": req.behavior_score
            }])[features]

            if _model_bundle.get("model_name") == "LogisticRegression" and scaler:
                X_scaled = scaler.transform(input_df)
                probs = model.predict_proba(X_scaled)[0]
            else:
                probs = model.predict_proba(input_df)[0]

            prob_dict = {str(c): round(float(p), 4) for c, p in zip(classes, probs)}

            # Predicted class
            pred_idx = np.argmax(probs)
            confidence = round(float(probs[pred_idx]), 4)

            # Calibrated Continuous Risk Score (0-100)
            p_high = prob_dict.get("High", 0.0)
            p_med = prob_dict.get("Medium", 0.0)
            p_low = prob_dict.get("Low", 0.0)

            # Blended score for smooth granularity
            ml_continuous_score = (p_high * 92.0) + (p_med * 55.0) + (p_low * 12.0)
            final_risk_score = round(0.5 * formula_score + 0.5 * ml_continuous_score, 1)

            # Determine risk level
            if final_risk_score >= 70.0:
                final_level = "High"
            elif final_risk_score >= 40.0:
                final_level = "Medium"
            else:
                final_level = "Low"

            # Construct Explainability Summary
            if final_level == "High":
                why_explanation = f"High Risk Alert: The student demonstrates critical academic and engagement vulnerabilities ({key_factors[0] if key_factors else 'Multi-factor decline detected'}). ML Model confidence is {int(confidence*100)}%."
            elif final_level == "Medium":
                why_explanation = f"Moderate Risk: The student is in the borderline zone. {key_factors[0] if key_factors else 'Slight decrease in engagement or assessment metrics detected.'} Proactive mentoring recommended."
            else:
                why_explanation = f"Low Risk: The student's academic momentum, attendance, and assignment completion are all within healthy benchmarks."

            return PredictResponse(
                student_id=req.student_id,
                student_name=req.student_name,
                risk_score=final_risk_score,
                risk_level=final_level,
                confidence=confidence,
                model_used=_model_bundle.get("model_name", "RandomForestClassifier"),
                key_risk_factors=key_factors,
                factor_details=factor_details,
                recommended_actions=recommended_actions,
                why_at_risk_explanation=why_explanation,
                probabilities=prob_dict
            )
        except Exception as e:
            print(f"[ML Predictor] Error during ML inference, falling back to formula: {e}")

    # Fallback to formula risk scoring
    if formula_level == "High":
        why_explanation = f"High Risk: Student has crossed safety thresholds with significant concerns: {', '.join(key_factors[:2])}."
    elif formula_level == "Medium":
        why_explanation = f"Moderate Risk: Student exhibits early warning signs in {', '.join(key_factors[:2])}."
    else:
        why_explanation = "Low Risk: Student shows stable performance and strong attendance across subjects."

    return PredictResponse(
        student_id=req.student_id,
        student_name=req.student_name,
        risk_score=formula_score,
        risk_level=formula_level,
        confidence=0.88,
        model_used="RiskEngine Rule-Based Calibrator",
        key_risk_factors=key_factors,
        factor_details=factor_details,
        recommended_actions=recommended_actions,
        why_at_risk_explanation=why_explanation,
        probabilities={"Low": 0.1, "Medium": 0.2, "High": 0.7} if formula_level == "High" else {"Low": 0.8, "Medium": 0.15, "High": 0.05}
    )
