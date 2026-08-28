from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

class AlertBase(BaseModel):
    student_id: str
    student_name: str
    risk_level: str
    risk_score: float
    title: str
    message: str
    reasons: List[str] = []
    status: str = "New"

class AlertCreate(AlertBase):
    pass

class AlertStatusUpdate(BaseModel):
    status: str # "New", "Reviewed", "Resolved"

class AlertResponse(AlertBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AlertStatsResponse(BaseModel):
    total_alerts: int
    new_alerts: int
    reviewed_alerts: int
    resolved_alerts: int
    high_risk_alerts: int
