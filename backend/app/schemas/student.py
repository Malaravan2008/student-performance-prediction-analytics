from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field
from datetime import datetime

class StudentBase(BaseModel):
    student_id: str
    name: str
    age: Optional[int] = 16
    grade: Optional[str] = "Grade 10"
    gender: Optional[str] = "Other"
    previous_gpa: float = Field(..., ge=0.0, le=4.0, description="GPA on 0.0 to 4.0 scale")
    test_score: float = Field(..., ge=0.0, le=100.0, description="Average Test Score (0-100)")
    attendance_percentage: float = Field(..., ge=0.0, le=100.0, description="Attendance % (0-100)")
    assignment_completion: float = Field(..., ge=0.0, le=100.0, description="Assignment Completion % (0-100)")
    lms_login_frequency: float = Field(..., ge=0.0, description="LMS Logins per month")
    class_participation: float = Field(..., ge=0.0, le=100.0, description="Class Participation % (0-100)")
    behavior_score: float = Field(..., ge=0.0, le=100.0, description="Behavior Score % (0-100)")

class StudentCreate(StudentBase):
    pass

class StudentUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    grade: Optional[str] = None
    previous_gpa: Optional[float] = None
    test_score: Optional[float] = None
    attendance_percentage: Optional[float] = None
    assignment_completion: Optional[float] = None
    lms_login_frequency: Optional[float] = None
    class_participation: Optional[float] = None
    behavior_score: Optional[float] = None

class StudentResponse(StudentBase):
    id: int
    risk_score: float
    risk_level: str
    risk_factors: List[str] = []
    academic_history: List[Dict[str, Any]] = []
    attendance_history: List[Dict[str, Any]] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class StudentListResponse(BaseModel):
    total: int
    students: List[StudentResponse]
