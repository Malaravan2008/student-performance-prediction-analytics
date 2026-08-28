from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class PredictRequest(BaseModel):
    student_id: Optional[str] = "STU-NEW"
    student_name: Optional[str] = "Candidate Student"
    age: Optional[int] = 16
    grade: Optional[str] = "Grade 10"
    previous_gpa: float = Field(..., ge=0.0, le=4.0, description="Previous GPA (0.0 - 4.0)")
    test_score: float = Field(..., ge=0.0, le=100.0, description="Average Test Score (0 - 100)")
    attendance_percentage: float = Field(..., ge=0.0, le=100.0, description="Attendance % (0 - 100)")
    assignment_completion: float = Field(..., ge=0.0, le=100.0, description="Assignment Completion % (0 - 100)")
    lms_login_frequency: float = Field(..., ge=0.0, description="LMS Logins per month")
    class_participation: float = Field(..., ge=0.0, le=100.0, description="Class Participation % (0 - 100)")
    behavior_score: float = Field(..., ge=0.0, le=100.0, description="Behavior Score % (0 - 100)")

class FactorDetail(BaseModel):
    factor: str
    status: str # "Critical", "Warning", "Good", "Excellent"
    value: Any
    benchmark: str
    contribution_weight: float
    insight: str

class PredictResponse(BaseModel):
    student_id: Optional[str] = None
    student_name: Optional[str] = None
    risk_score: float # 0.0 - 100.0
    risk_level: str   # "Low", "Medium", "High"
    confidence: Optional[float] = 0.92
    model_used: str
    key_risk_factors: List[str]
    factor_details: List[FactorDetail]
    recommended_actions: List[str]
    why_at_risk_explanation: str
    probabilities: Optional[Dict[str, float]] = None
