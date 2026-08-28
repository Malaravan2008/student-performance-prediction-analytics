from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, JSON
from app.database.session import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String(50), index=True, nullable=False)
    student_name = Column(String(100), nullable=False)
    risk_level = Column(String(20), nullable=False) # High / Medium / Low
    risk_score = Column(Float, nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    reasons = Column(JSON, default=list)
    status = Column(String(20), default="New") # New / Reviewed / Resolved
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
