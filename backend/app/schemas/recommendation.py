from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime

class RecommendationBase(BaseModel):
    student_id: str
    student_name: str
    risk_level: str
    risk_score: float
    main_problem: str
    recommended_intervention: str
    priority: str = "Medium" # Urgent / High / Medium / Low
    status: str = "Pending"   # Pending / In Progress / Completed
    action_plan: List[Dict[str, Any]] = []

class RecommendationCreate(RecommendationBase):
    pass

class RecommendationStatusUpdate(BaseModel):
    status: str # "Pending", "In Progress", "Completed"

class RecommendationResponse(RecommendationBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
