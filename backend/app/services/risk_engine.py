from typing import Dict, Any, List, Tuple
from app.schemas.prediction import FactorDetail

# Configurable weights for transparent prototype risk scoring
DEFAULT_WEIGHTS = {
    "academic": 0.30,       # GPA (15%) + Test Scores (15%)
    "attendance": 0.25,     # Attendance percentage
    "assignments": 0.15,    # Assignment completion rate
    "lms_engagement": 0.15, # LMS login activity
    "participation": 0.10,  # Classroom engagement
    "behavior": 0.05        # Behavioral score
}

# Configurable thresholds
DEFAULT_THRESHOLDS = {
    "low_max": 39.0,
    "medium_max": 69.0,
    "high_min": 70.0
}

def calculate_formula_risk(
    previous_gpa: float,
    test_score: float,
    attendance_percentage: float,
    assignment_completion: float,
    lms_login_frequency: float,
    class_participation: float,
    behavior_score: float,
    weights: Dict[str, float] = None
) -> Tuple[float, str, List[str], List[FactorDetail]]:
    """
    Computes a transparent, normalized risk score (0-100%) and explains exactly why a student is at risk.
    Higher score indicates higher risk of academic underperformance/failure.
    """
    if weights is None:
        weights = DEFAULT_WEIGHTS

    # 1. Academic Risk: GPA (0-4 scale) & Test Score (0-100 scale)
    # GPA < 2.0 or Test < 50 generates high deficiency
    gpa_deficiency = max(0.0, min(100.0, (4.0 - previous_gpa) / 2.5 * 100.0))
    test_deficiency = max(0.0, min(100.0, (100.0 - test_score) * 1.3))
    academic_risk = (gpa_deficiency * 0.5) + (test_deficiency * 0.5)

    # 2. Attendance Risk: Attendance below 75% scales up quickly
    attendance_risk = max(0.0, min(100.0, (100.0 - attendance_percentage) * 1.8))

    # 3. Assignment Completion Risk
    assignment_risk = max(0.0, min(100.0, (100.0 - assignment_completion) * 1.4))

    # 4. LMS Logins (20+ logins/month -> 0 risk, 0 logins -> 100 risk)
    lms_risk = max(0.0, min(100.0, (20.0 - lms_login_frequency) / 20.0 * 100.0))

    # 5. Class Participation
    participation_risk = max(0.0, min(100.0, (100.0 - class_participation) * 1.2))

    # 6. Behavior Score
    behavior_risk = max(0.0, min(100.0, (100.0 - behavior_score) * 1.2))

    # Weighted aggregate score (0 - 100)
    total_risk = (
        (academic_risk * weights["academic"]) +
        (attendance_risk * weights["attendance"]) +
        (assignment_risk * weights["assignments"]) +
        (lms_risk * weights["lms_engagement"]) +
        (participation_risk * weights["participation"]) +
        (behavior_risk * weights["behavior"])
    )
    
    risk_score = round(max(0.0, min(100.0, total_risk)), 1)

    # Determine risk level
    if risk_score <= DEFAULT_THRESHOLDS["low_max"]:
        risk_level = "Low"
    elif risk_score <= DEFAULT_THRESHOLDS["medium_max"]:
        risk_level = "Medium"
    else:
        risk_level = "High"

    # Identify Key Risk Factors & Factor Details
    key_factors = []
    factor_details = []

    # Check Attendance
    if attendance_percentage < 75.0:
        status = "Critical" if attendance_percentage < 65.0 else "Warning"
        key_factors.append(f"Attendance is critically low at {attendance_percentage:.1f}% (Benchmark: >= 80%)")
        factor_details.append(FactorDetail(
            factor="Attendance",
            status=status,
            value=f"{attendance_percentage:.1f}%",
            benchmark=">= 80%",
            contribution_weight=weights["attendance"] * 100,
            insight="Poor attendance directly correlates with missed lectures and gaps in learning."
        ))
    else:
        factor_details.append(FactorDetail(
            factor="Attendance",
            status="Good",
            value=f"{attendance_percentage:.1f}%",
            benchmark=">= 80%",
            contribution_weight=weights["attendance"] * 100,
            insight="Consistent attendance supporting course engagement."
        ))

    # Check Academic Performance
    if test_score < 65.0 or previous_gpa < 2.5:
        status = "Critical" if test_score < 50.0 else "Warning"
        key_factors.append(f"Academic test scores ({test_score:.1f}%) and GPA ({previous_gpa:.2f}) below standard")
        factor_details.append(FactorDetail(
            factor="Academic Performance",
            status=status,
            value=f"GPA: {previous_gpa:.2f}, Tests: {test_score:.1f}%",
            benchmark="GPA >= 3.0, Tests >= 70%",
            contribution_weight=weights["academic"] * 100,
            insight="Struggling with core syllabus comprehension and exam evaluations."
        ))
    else:
        factor_details.append(FactorDetail(
            factor="Academic Performance",
            status="Good",
            value=f"GPA: {previous_gpa:.2f}, Tests: {test_score:.1f}%",
            benchmark="GPA >= 3.0, Tests >= 70%",
            contribution_weight=weights["academic"] * 100,
            insight="Solid academic foundation and evaluation mastery."
        ))

    # Check Assignment Completion
    if assignment_completion < 70.0:
        status = "Critical" if assignment_completion < 50.0 else "Warning"
        key_factors.append(f"Low assignment submission rate ({assignment_completion:.1f}%)")
        factor_details.append(FactorDetail(
            factor="Assignment Completion",
            status=status,
            value=f"{assignment_completion:.1f}%",
            benchmark=">= 85%",
            contribution_weight=weights["assignments"] * 100,
            insight="Incomplete coursework indicates missing formative feedback loops."
        ))
    else:
        factor_details.append(FactorDetail(
            factor="Assignment Completion",
            status="Good",
            value=f"{assignment_completion:.1f}%",
            benchmark=">= 85%",
            contribution_weight=weights["assignments"] * 100,
            insight="Submits assignments punctually."
        ))

    # Check LMS Engagement
    if lms_login_frequency < 8.0:
        status = "Critical" if lms_login_frequency < 4.0 else "Warning"
        key_factors.append(f"Infrequent digital LMS engagement ({lms_login_frequency:.0f} logins/mo)")
        factor_details.append(FactorDetail(
            factor="LMS Engagement",
            status=status,
            value=f"{lms_login_frequency:.0f} logins/mo",
            benchmark=">= 12 logins/mo",
            contribution_weight=weights["lms_engagement"] * 100,
            insight="Low online platform usage indicates disengagement with digital materials."
        ))
    else:
        factor_details.append(FactorDetail(
            factor="LMS Engagement",
            status="Good",
            value=f"{lms_login_frequency:.0f} logins/mo",
            benchmark=">= 12 logins/mo",
            contribution_weight=weights["lms_engagement"] * 100,
            insight="Active digital resource utilization."
        ))

    # Check Participation
    if class_participation < 60.0:
        key_factors.append(f"Passive classroom participation ({class_participation:.1f}%)")
        factor_details.append(FactorDetail(
            factor="Class Participation",
            status="Warning",
            value=f"{class_participation:.1f}%",
            benchmark=">= 70%",
            contribution_weight=weights["participation"] * 100,
            insight="Low interaction in discussions and group activities."
        ))

    # Fallback if no specific factors triggered but risk is Low
    if not key_factors:
        key_factors.append("All academic and behavioral indicators are healthy and on track.")

    return risk_score, risk_level, key_factors, factor_details
