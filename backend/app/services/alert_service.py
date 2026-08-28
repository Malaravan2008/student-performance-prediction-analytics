from sqlalchemy.orm import Session
from app.models.alert import Alert
from app.models.student import Student
from typing import List, Optional

def generate_alert_for_student(student: Student, db: Session) -> Optional[Alert]:
    """
    Generates or updates early warning alert if student crosses risk thresholds.
    """
    if student.risk_level not in ["High", "Medium"]:
        return None

    # Check if an active alert already exists for this student
    existing_alert = db.query(Alert).filter(Alert.student_id == student.student_id).first()
    
    reasons = student.risk_factors or []
    if student.risk_level == "High":
        title = f"CRITICAL: {student.name} has crossed High-Risk threshold ({student.risk_score:.1f}%)"
        message = f"Immediate faculty intervention required for {student.name} ({student.grade}). Academic test scores ({student.test_score:.1f}%) or attendance ({student.attendance_percentage:.1f}%) have dropped into critical territory."
    else:
        title = f"WARNING: {student.name} exhibits Moderate Risk indicators ({student.risk_score:.1f}%)"
        message = f"Proactive monitoring recommended for {student.name}. Showing signs of reduced engagement or declining test evaluations."

    if existing_alert:
        existing_alert.risk_level = student.risk_level
        existing_alert.risk_score = student.risk_score
        existing_alert.title = title
        existing_alert.message = message
        existing_alert.reasons = reasons
        db.commit()
        db.refresh(existing_alert)
        return existing_alert
    else:
        new_alert = Alert(
            student_id=student.student_id,
            student_name=student.name,
            risk_level=student.risk_level,
            risk_score=student.risk_score,
            title=title,
            message=message,
            reasons=reasons,
            status="New"
        )
        db.add(new_alert)
        db.commit()
        db.refresh(new_alert)
        return new_alert

def update_alert_status(alert_id: int, status: str, db: Session) -> Optional[Alert]:
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if alert:
        alert.status = status
        db.commit()
        db.refresh(alert)
    return alert
