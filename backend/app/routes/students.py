from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc

from app.database.session import get_db
from app.models.student import Student
from app.schemas.student import StudentResponse, StudentListResponse, StudentCreate, StudentUpdate
from app.services.risk_engine import calculate_formula_risk
from app.services.alert_service import generate_alert_for_student
from app.services.recommendation_engine import generate_recommendations
from app.models.recommendation import Recommendation

router = APIRouter(prefix="/students", tags=["Students"])

@router.get("", response_model=StudentListResponse)
def list_students(
    search: Optional[str] = Query(None, description="Search by name or ID"),
    risk_level: Optional[str] = Query(None, description="Filter by Low, Medium, High"),
    grade: Optional[str] = Query(None, description="Filter by Grade"),
    sort_by: Optional[str] = Query("risk_score_desc", description="Sort criteria"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(Student)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Student.name.ilike(search_pattern)) | (Student.student_id.ilike(search_pattern))
        )

    if risk_level and risk_level.lower() != "all":
        query = query.filter(Student.risk_level.ilike(risk_level))

    if grade and grade.lower() != "all":
        query = query.filter(Student.grade.ilike(grade))

    # Sorting
    if sort_by == "risk_score_desc":
        query = query.order_by(desc(Student.risk_score))
    elif sort_by == "risk_score_asc":
        query = query.order_by(asc(Student.risk_score))
    elif sort_by == "name_asc":
        query = query.order_by(asc(Student.name))
    elif sort_by == "attendance_asc":
        query = query.order_by(asc(Student.attendance_percentage))
    elif sort_by == "gpa_asc":
        query = query.order_by(asc(Student.previous_gpa))
    else:
        query = query.order_by(desc(Student.risk_score))

    total = query.count()
    students = query.offset(skip).limit(limit).all()

    return StudentListResponse(total=total, students=students)

@router.get("/{student_id}", response_model=StudentResponse)
def get_student(student_id: str, db: Session = Depends(get_db)):
    student = db.query(Student).filter(
        (Student.student_id == student_id) | (Student.id == int(student_id) if student_id.isdigit() else False)
    ).first()

    if not student:
        raise HTTPException(status_code=404, detail=f"Student with ID '{student_id}' not found.")

    return student

@router.post("", response_model=StudentResponse)
def create_student(student_in: StudentCreate, db: Session = Depends(get_db)):
    existing = db.query(Student).filter(Student.student_id == student_in.student_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Student ID already exists.")

    # Calculate Risk Score & Factors
    risk_score, risk_level, key_factors, _ = calculate_formula_risk(
        previous_gpa=student_in.previous_gpa,
        test_score=student_in.test_score,
        attendance_percentage=student_in.attendance_percentage,
        assignment_completion=student_in.assignment_completion,
        lms_login_frequency=student_in.lms_login_frequency,
        class_participation=student_in.class_participation,
        behavior_score=student_in.behavior_score
    )

    # Historical trends
    acad_hist = [
        {"month": "Nov", "gpa": round(student_in.previous_gpa, 2), "test_score": round(student_in.test_score, 1)},
        {"month": "Dec", "gpa": round(student_in.previous_gpa, 2), "test_score": round(student_in.test_score, 1)},
        {"month": "Jan", "gpa": round(student_in.previous_gpa, 2), "test_score": round(student_in.test_score, 1)},
        {"month": "Feb", "gpa": round(student_in.previous_gpa, 2), "test_score": round(student_in.test_score, 1)},
        {"month": "Mar", "gpa": round(student_in.previous_gpa, 2), "test_score": round(student_in.test_score, 1)}
    ]
    att_hist = [
        {"month": "Nov", "attendance": round(student_in.attendance_percentage, 1)},
        {"month": "Dec", "attendance": round(student_in.attendance_percentage, 1)},
        {"month": "Jan", "attendance": round(student_in.attendance_percentage, 1)},
        {"month": "Feb", "attendance": round(student_in.attendance_percentage, 1)},
        {"month": "Mar", "attendance": round(student_in.attendance_percentage, 1)}
    ]

    new_student = Student(
        student_id=student_in.student_id,
        name=student_in.name,
        age=student_in.age,
        grade=student_in.grade,
        gender=student_in.gender,
        previous_gpa=student_in.previous_gpa,
        test_score=student_in.test_score,
        attendance_percentage=student_in.attendance_percentage,
        assignment_completion=student_in.assignment_completion,
        lms_login_frequency=student_in.lms_login_frequency,
        class_participation=student_in.class_participation,
        behavior_score=student_in.behavior_score,
        risk_score=risk_score,
        risk_level=risk_level,
        risk_factors=key_factors,
        academic_history=acad_hist,
        attendance_history=att_hist
    )
    db.add(new_student)
    db.commit()
    db.refresh(new_student)

    # Auto generate alerts and recommendations if applicable
    if risk_level in ["High", "Medium"]:
        generate_alert_for_student(new_student, db)

    main_prob, intervention, priority, actions, plan = generate_recommendations(
        student_id=new_student.student_id,
        name=new_student.name,
        risk_level=risk_level,
        risk_score=risk_score,
        attendance_percentage=new_student.attendance_percentage,
        previous_gpa=new_student.previous_gpa,
        test_score=new_student.test_score,
        assignment_completion=new_student.assignment_completion,
        lms_login_frequency=new_student.lms_login_frequency,
        class_participation=new_student.class_participation,
        behavior_score=new_student.behavior_score
    )
    rec = Recommendation(
        student_id=new_student.student_id,
        student_name=new_student.name,
        risk_level=risk_level,
        risk_score=risk_score,
        main_problem=main_prob,
        recommended_intervention=intervention,
        priority=priority,
        status="Pending" if priority == "Urgent" else "In Progress",
        action_plan=plan
    )
    db.add(rec)
    db.commit()

    return new_student
