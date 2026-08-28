from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.prediction import PredictRequest, PredictResponse
from app.ml.predictor import predict_student_risk
from app.models.prediction import PredictionLog

router = APIRouter(prefix="/predict", tags=["Prediction"])

@router.post("", response_model=PredictResponse)
def predict_risk(req: PredictRequest, db: Session = Depends(get_db)):
    """
    Predicts student risk score and risk level (Low, Medium, High).
    Generates explainable insights and personalized intervention recommendations.
    Logs prediction in database.
    """
    result = predict_student_risk(req)

    # Log prediction into DB
    try:
        log_entry = PredictionLog(
            student_id=req.student_id,
            student_name=req.student_name,
            input_data=req.model_dump(),
            predicted_risk_score=result.risk_score,
            predicted_risk_level=result.risk_level,
            model_used=result.model_used,
            feature_contributions=result.probabilities or {},
            key_risk_factors=result.key_risk_factors,
            recommended_actions=result.recommended_actions
        )
        db.add(log_entry)
        db.commit()
    except Exception as e:
        print(f"[Predict Route] Could not log prediction: {e}")

    return result
