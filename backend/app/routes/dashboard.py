from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.session import get_db
from app.models.student import Student
from app.models.alert import Alert
from app.models.recommendation import Recommendation
from app.schemas.metrics import DashboardSummaryResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("", response_model=DashboardSummaryResponse)
def get_dashboard_summary(db: Session = Depends(get_db)):
    students = db.query(Student).all()
    total_students = len(students)

    if total_students == 0:
        return DashboardSummaryResponse(
            total_students=0,
            low_risk_count=0,
            medium_risk_count=0,
            high_risk_count=0,
            average_attendance=0.0,
            average_gpa=0.0,
            average_test_score=0.0,
            average_engagement=0.0,
            total_alerts=0,
            pending_recommendations=0,
            risk_distribution={"Low": 0, "Medium": 0, "High": 0},
            performance_trends=[],
            attendance_vs_performance=[],
            risk_factor_distribution={}
        )

    low_count = sum(1 for s in students if s.risk_level.lower() == "low")
    med_count = sum(1 for s in students if s.risk_level.lower() == "medium")
    high_count = sum(1 for s in students if s.risk_level.lower() == "high")

    avg_att = round(sum(s.attendance_percentage for s in students) / total_students, 1)
    avg_gpa = round(sum(s.previous_gpa for s in students) / total_students, 2)
    avg_test = round(sum(s.test_score for s in students) / total_students, 1)
    avg_lms = round(sum(s.lms_login_frequency for s in students) / total_students, 1)

    total_alerts = db.query(Alert).filter(Alert.status != "Resolved").count()
    pending_recs = db.query(Recommendation).filter(Recommendation.status == "Pending").count()

    # Risk Distribution
    risk_distribution = {
        "Low": low_count,
        "Medium": med_count,
        "High": high_count
    }

    # Aggregate Performance Trends across 5 months
    months = ["Nov", "Dec", "Jan", "Feb", "Mar"]
    perf_trends = []
    for m in months:
        gpas = []
        tests = []
        atts = []
        for s in students:
            if s.academic_history:
                for entry in s.academic_history:
                    if entry.get("month") == m:
                        gpas.append(entry.get("gpa", s.previous_gpa))
                        tests.append(entry.get("test_score", s.test_score))
            if s.attendance_history:
                for entry in s.attendance_history:
                    if entry.get("month") == m:
                        atts.append(entry.get("attendance", s.attendance_percentage))
        
        perf_trends.append({
            "month": m,
            "avg_gpa": round(sum(gpas)/len(gpas), 2) if gpas else avg_gpa,
            "avg_test_score": round(sum(tests)/len(tests), 1) if tests else avg_test,
            "avg_attendance": round(sum(atts)/len(atts), 1) if atts else avg_att
        })

    # Scatter Plot data (Attendance vs Test Score, colored by Risk Level)
    scatter_data = []
    for s in students[:60]: # Sample for clean visual
        scatter_data.append({
            "student_id": s.student_id,
            "name": s.name,
            "attendance": s.attendance_percentage,
            "test_score": s.test_score,
            "gpa": s.previous_gpa,
            "risk_score": s.risk_score,
            "risk_level": s.risk_level
        })

    # Risk Factors distribution
    factor_counts = {
        "Low Attendance (<75%)": sum(1 for s in students if s.attendance_percentage < 75.0),
        "Low Test Scores (<65%)": sum(1 for s in students if s.test_score < 65.0),
        "Low Assignment Completion (<65%)": sum(1 for s in students if s.assignment_completion < 65.0),
        "Low LMS Logins (<8/mo)": sum(1 for s in students if s.lms_login_frequency < 8.0),
        "Low Participation (<60%)": sum(1 for s in students if s.class_participation < 60.0),
        "Behavioral Concerns (<70%)": sum(1 for s in students if s.behavior_score < 70.0)
    }

    return DashboardSummaryResponse(
        total_students=total_students,
        low_risk_count=low_count,
        medium_risk_count=med_count,
        high_risk_count=high_count,
        average_attendance=avg_att,
        average_gpa=avg_gpa,
        average_test_score=avg_test,
        average_engagement=avg_lms,
        total_alerts=total_alerts,
        pending_recommendations=pending_recs,
        risk_distribution=risk_distribution,
        performance_trends=perf_trends,
        attendance_vs_performance=scatter_data,
        risk_factor_distribution=factor_counts
    )
