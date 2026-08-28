from typing import List, Dict, Any, Tuple

def generate_recommendations(
    student_id: str,
    name: str,
    risk_level: str,
    risk_score: float,
    attendance_percentage: float,
    previous_gpa: float,
    test_score: float,
    assignment_completion: float,
    lms_login_frequency: float,
    class_participation: float,
    behavior_score: float
) -> Tuple[str, str, str, List[str], List[Dict[str, Any]]]:
    """
    Evaluates real student indicators to generate context-specific interventions and action steps.
    Returns: (main_problem, recommended_intervention, priority, recommended_actions, action_plan)
    """
    interventions = []
    actions = []
    action_plan = []
    main_problems = []

    # Priority determination
    if risk_level == "High" or risk_score >= 70.0:
        priority = "Urgent"
    elif risk_level == "Medium" or risk_score >= 40.0:
        priority = "High"
    else:
        priority = "Medium" if risk_score > 25.0 else "Low"

    # Rule 1: Attendance
    if attendance_percentage < 75.0:
        main_problems.append(f"Severe attendance deficit ({attendance_percentage:.1f}%)")
        interventions.append(
            "Initiate immediate attendance counseling with the student counselor and schedule a parent-teacher alignment meeting."
        )
        actions.append("Schedule 1-on-1 attendance counseling session")
        action_plan.append({
            "step": 1,
            "title": "Attendance & Habit Review",
            "desc": "Convene meeting with student counselor and parent to identify transport, health, or schedule blockers.",
            "owner": "Academic Counselor",
            "target_days": 3
        })

    # Rule 2: Academic Struggles (GPA / Test Scores)
    if test_score < 65.0 or previous_gpa < 2.5:
        main_problems.append(f"Academic underperformance (Test Score: {test_score:.1f}%, GPA: {previous_gpa:.2f})")
        interventions.append(
            "Assign dedicated faculty mentoring, enroll in after-school concept workshops, and provide targeted exam revision modules."
        )
        actions.append("Assign subject faculty mentor for weekly tutoring")
        actions.append("Provide targeted concept revision material and practice quizzes")
        action_plan.append({
            "step": 2,
            "title": "Targeted Tutoring & Mentorship",
            "desc": "Pair student with subject faculty for twice-weekly 45-minute remedial sessions on core weak topics.",
            "owner": "Subject Faculty",
            "target_days": 7
        })

    # Rule 3: Assignment Completion
    if assignment_completion < 65.0:
        main_problems.append(f"Low assignment completion rate ({assignment_completion:.1f}%)")
        interventions.append(
            "Implement structured deadline pacing, provide peer study group support, and enable progressive milestone checkpoints."
        )
        actions.append("Setup scaffolded assignment milestones and automated reminder triggers")
        action_plan.append({
            "step": 3,
            "title": "Coursework Pacing Support",
            "desc": "Break upcoming major deliverables into 3 smaller weekly milestones with automated SMS/LMS alerts.",
            "owner": "Class Teacher",
            "target_days": 5
        })

    # Rule 4: Digital LMS Engagement
    if lms_login_frequency < 8.0:
        main_problems.append(f"Disengaged LMS activity ({lms_login_frequency:.0f} logins/mo)")
        interventions.append(
            "Encourage regular LMS activity with interactive bite-sized learning modules and send weekly digest of required resources."
        )
        actions.append("Send weekly curated digital resource links and track portal progress")
        action_plan.append({
            "step": 4,
            "title": "LMS Resource Engagement",
            "desc": "Grant access to interactive flashcards and guided video lectures; track completion on dashboard.",
            "owner": "EdTech Coordinator",
            "target_days": 10
        })

    # Rule 5: Behavioral / Participation
    if behavior_score < 70.0 or class_participation < 60.0:
        main_problems.append(f"Subdued classroom engagement & participation ({class_participation:.1f}%)")
        interventions.append(
            "Engage student in collaborative small-group activities and provide positive reinforcement for active participation."
        )
        actions.append("Integrate into small-group breakout discussions")

    # If student is doing well (Low Risk)
    if not main_problems:
        main_problem = "Student is performing well across all standard indicators"
        recommended_intervention = "Maintain current learning trajectory, offer advanced enrichment challenges, and consider for peer-tutoring leadership."
        actions = [
            "Encourage participation in advanced honors projects",
            "Nominate for peer-tutor or study group leader role",
            "Provide periodic positive reinforcement"
        ]
        action_plan.append({
            "step": 1,
            "title": "Enrichment & Leadership",
            "desc": "Offer optional advanced research topics or leadership opportunities in project groups.",
            "owner": "Class Teacher",
            "target_days": 14
        })
    else:
        main_problem = " | ".join(main_problems[:2])
        recommended_intervention = " ".join(interventions)

    return main_problem, recommended_intervention, priority, actions, action_plan
