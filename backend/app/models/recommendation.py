from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON
from app.database.session import Base

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String(50), index=True, nullable=False)
    student_name = Column(String(100), nullable=False)
    risk_level = Column(String(20), nullable=False)
    risk_score = Column(Float, nullable=False)
    main_problem = Column(String(255), nullable=False)
    recommended_intervention = Column(Text, nullable=False)
    priority = Column(String(20), default="Medium") # Urgent / High / Medium / Low
    status = Column(String(20), default="Pending")   # Pending / In Progress / Completed
    action_plan = Column(JSON, default=list)        # Structured action steps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
