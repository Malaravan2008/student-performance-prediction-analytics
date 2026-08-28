from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
from app.database.session import Base

class PredictionLog(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String(50), nullable=True)
    student_name = Column(String(100), nullable=True)
    
    # Input feature snapshot
    input_data = Column(JSON, nullable=False)
    
    # Model predictions
    predicted_risk_score = Column(Float, nullable=False)
    predicted_risk_level = Column(String(20), nullable=False)
    model_used = Column(String(50), default="RandomForestClassifier")
    
    # Explainable insights
    feature_contributions = Column(JSON, default=dict)
    key_risk_factors = Column(JSON, default=list)
    recommended_actions = Column(JSON, default=list)
    
    created_at = Column(DateTime, default=datetime.utcnow)
