from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON
from app.database.session import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    age = Column(Integer, default=16)
    grade = Column(String(20), default="Grade 10")
    gender = Column(String(20), default="Other")
    
    # Academic & Engagement Metrics
    previous_gpa = Column(Float, nullable=False, default=3.0)  # On 0.0 - 4.0 scale
    test_score = Column(Float, nullable=False, default=75.0)   # 0 - 100%
    attendance_percentage = Column(Float, nullable=False, default=85.0) # 0 - 100%
    assignment_completion = Column(Float, nullable=False, default=80.0) # 0 - 100%
    lms_login_frequency = Column(Float, nullable=False, default=12.0)   # logins per month
    class_participation = Column(Float, nullable=False, default=70.0)   # 0 - 100%
    behavior_score = Column(Float, nullable=False, default=85.0)        # 0 - 100%
    
    # Calculated Risk & Assessment
    risk_score = Column(Float, nullable=False, default=25.0)            # 0 - 100%
    risk_level = Column(String(20), nullable=False, default="Low")     # Low / Medium / High
    risk_factors = Column(JSON, default=list)                           # List of strings/reasons
    
    # Historical Trends for Rich Visualizations (JSON stored list of historical datapoints)
    academic_history = Column(JSON, default=list) # e.g. [{"month": "Sep", "gpa": 3.2, "test_score": 82}]
    attendance_history = Column(JSON, default=list) # e.g. [{"month": "Sep", "attendance": 90}]
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
