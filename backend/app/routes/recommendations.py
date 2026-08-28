from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database.session import get_db
from app.models.recommendation import Recommendation
from app.models.student import Student
from app.schemas.recommendation import RecommendationResponse, RecommendationStatusUpdate
from app.services.recommendation_engine import generate_recommendations

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

@router.get("", response_model=List[RecommendationResponse])
def get_recommendations(
    priority: Optional[str] = Query(None, description="Filter by Urgent, High, Medium, Low"),
    status: Optional[str] = Query(None, description="Filter by Pending, In Progress, Completed"),
    search: Optional[str] = Query(None, description="Search student name or ID"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(Recommendation)

    if priority and priority.lower() != "all":
        query = query.filter(Recommendation.priority.ilike(priority))

    if status and status.lower() != "all":
        query = query.filter(Recommendation.status.ilike(status))

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Recommendation.student_name.ilike(search_pattern)) | 
            (Recommendation.student_id.ilike(search_pattern))
        )

    # Priority custom ordering: Urgent > High > Medium > Low
    recs = query.order_by(desc(Recommendation.risk_score)).offset(skip).limit(limit).all()
    return recs

@router.get("/{student_id}", response_model=RecommendationResponse)
def get_student_recommendation(student_id: str, db: Session = Depends(get_db)):
    rec = db.query(Recommendation).filter(Recommendation.student_id == student_id).first()
    
    if not rec:
        # Fallback: check if student exists and generate on the fly
        student = db.query(Student).filter(Student.student_id == student_id).first()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        main_prob, intervention, priority, actions, action_plan = generate_recommendations(
            student_id=student.student_id,
            name=student.name,
            risk_level=student.risk_level,
            risk_score=student.risk_score,
            attendance_percentage=student.attendance_percentage,
            previous_gpa=student.previous_gpa,
            test_score=student.test_score,
            assignment_completion=student.assignment_completion,
            lms_login_frequency=student.lms_login_frequency,
            class_participation=student.class_participation,
            behavior_score=student.behavior_score
        )

        rec = Recommendation(
            student_id=student.student_id,
            student_name=student.name,
            risk_level=student.risk_level,
            risk_score=student.risk_score,
            main_problem=main_prob,
            recommended_intervention=intervention,
            priority=priority,
            status="Pending",
            action_plan=action_plan
        )
        db.add(rec)
        db.commit()
        db.refresh(rec)

    return rec

@router.patch("/{recommendation_id}/status", response_model=RecommendationResponse)
def update_recommendation_status_endpoint(
    recommendation_id: int,
    status_update: RecommendationStatusUpdate,
    db: Session = Depends(get_db)
):
    rec = db.query(Recommendation).filter(Recommendation.id == recommendation_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    rec.status = status_update.status
    db.commit()
    db.refresh(rec)
    return rec
