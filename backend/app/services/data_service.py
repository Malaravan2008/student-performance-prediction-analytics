import os
import random
import pandas as pd
from typing import List
from sqlalchemy.orm import Session
from app.models.student import Student
from app.models.alert import Alert
from app.models.recommendation import Recommendation
from app.models.user import User
from app.services.risk_engine import calculate_formula_risk
from app.services.recommendation_engine import generate_recommendations

FIRST_NAMES = [
    "Arun", "Priya", "Rahul", "Ananya", "Vikram", "Sneha", "Rohan", "Meera",
    "Aditya", "Kavya", "Siddharth", "Pooja", "Kiran", "Divya", "Sanjay", "Deepika",
    "Nikhil", "Ishaan", "Riya", "Varun", "Tanvi", "Manish", "Shreya", "Amit",
    "Neha", "Harish", "Preeti", "Karthik", "Swati", "Gaurav", "Nisha", "Rajesh",
    "Sunita", "Tarun", "Aarti", "Manoj", "Bhavna", "Alok", "Lavanya", "Vivek"
]

LAST_NAMES = [
    "Kumar", "Sharma", "Verma", "Patel", "Reddy", "Iyer", "Nair", "Gupta",
    "Rao", "Mishra", "Singh", "Choudhury", "Bose", "Mehta", "Das", "Joshi",
    "Menon", "Kapoor", "Pillai", "Bhat", "Deshmukh", "Ghosh", "Agarwal", "Saxena"
]

GRADES = ["Grade 9", "Grade 10", "Grade 11", "Grade 12"]
MONTHS = ["Nov", "Dec", "Jan", "Feb", "Mar"]

def generate_fictional_student_dataset(n: int = 75) -> List[dict]:
    """
    Generates realistic, logically coherent fictional student data with low, medium, and high risk distributions.
    """
    random.seed(42) # Deterministic for consistent hackathon demo reproducibility
    students = []
    
    # 25% High Risk, 35% Medium Risk, 40% Low Risk
    cohort_types = (
        ["HIGH"] * int(n * 0.25) +
        ["MEDIUM"] * int(n * 0.35) +
        ["LOW"] * (n - int(n * 0.25) - int(n * 0.35))
    )
    random.shuffle(cohort_types)

    used_names = set()

    for idx, cohort in enumerate(cohort_types):
        while True:
            name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
            if name not in used_names:
                used_names.add(name)
                break

        student_id = f"STU-{1000 + idx + 1}"
        grade = random.choice(GRADES)
        age = 14 + int(grade.split()[-1]) - 9

        if cohort == "HIGH":
            # Struggling student profile: High risk (70-95%)
            attendance = round(random.uniform(48.0, 68.0), 1)
            prev_gpa = round(random.uniform(1.4, 2.2), 2)
            test_score = round(random.uniform(35.0, 56.0), 1)
            assignment_comp = round(random.uniform(35.0, 58.0), 1)
            lms_logins = round(random.uniform(1.0, 5.0), 1)
            participation = round(random.uniform(30.0, 52.0), 1)
            behavior = round(random.uniform(50.0, 70.0), 1)
            
            acad_hist = [
                {"month": "Nov", "gpa": round(prev_gpa + 0.6, 2), "test_score": round(test_score + 16, 1)},
                {"month": "Dec", "gpa": round(prev_gpa + 0.4, 2), "test_score": round(test_score + 11, 1)},
                {"month": "Jan", "gpa": round(prev_gpa + 0.2, 2), "test_score": round(test_score + 6, 1)},
                {"month": "Feb", "gpa": round(prev_gpa, 2), "test_score": round(test_score, 1)},
                {"month": "Mar", "gpa": round(max(1.0, prev_gpa - 0.2), 2), "test_score": round(max(30.0, test_score - 4), 1)}
            ]
            att_hist = [
                {"month": "Nov", "attendance": round(min(100.0, attendance + 20), 1)},
                {"month": "Dec", "attendance": round(min(100.0, attendance + 14), 1)},
                {"month": "Jan", "attendance": round(min(100.0, attendance + 7), 1)},
                {"month": "Feb", "attendance": round(attendance, 1)},
                {"month": "Mar", "attendance": round(max(35.0, attendance - 4), 1)}
            ]

        elif cohort == "MEDIUM":
            # Borderline student profile: Medium risk (40-69%)
            attendance = round(random.uniform(72.0, 81.0), 1)
            prev_gpa = round(random.uniform(2.4, 2.9), 2)
            test_score = round(random.uniform(60.0, 73.0), 1)
            assignment_comp = round(random.uniform(62.0, 78.0), 1)
            lms_logins = round(random.uniform(7.0, 12.0), 1)
            participation = round(random.uniform(58.0, 74.0), 1)
            behavior = round(random.uniform(72.0, 84.0), 1)
            
            acad_hist = [
                {"month": "Nov", "gpa": round(prev_gpa + 0.3, 2), "test_score": round(test_score + 5, 1)},
                {"month": "Dec", "gpa": round(prev_gpa + 0.1, 2), "test_score": round(test_score + 3, 1)},
                {"month": "Jan", "gpa": round(prev_gpa - 0.1, 2), "test_score": round(test_score - 2, 1)},
                {"month": "Feb", "gpa": round(prev_gpa, 2), "test_score": round(test_score, 1)},
                {"month": "Mar", "gpa": round(prev_gpa - 0.1, 2), "test_score": round(test_score - 2, 1)}
            ]
            att_hist = [
                {"month": "Nov", "attendance": round(attendance + 5, 1)},
                {"month": "Dec", "attendance": round(attendance + 2, 1)},
                {"month": "Jan", "attendance": round(attendance - 2, 1)},
                {"month": "Feb", "attendance": round(attendance, 1)},
                {"month": "Mar", "attendance": round(attendance - 1, 1)}
            ]

        else: # LOW RISK (0-39%)
            attendance = round(random.uniform(88.0, 98.0), 1)
            prev_gpa = round(random.uniform(3.4, 4.0), 2)
            test_score = round(random.uniform(82.0, 98.0), 1)
            assignment_comp = round(random.uniform(88.0, 100.0), 1)
            lms_logins = round(random.uniform(16.0, 30.0), 1)
            participation = round(random.uniform(82.0, 98.0), 1)
            behavior = round(random.uniform(90.0, 100.0), 1)
            
            acad_hist = [
                {"month": "Nov", "gpa": round(min(4.0, prev_gpa - 0.1), 2), "test_score": round(test_score - 2, 1)},
                {"month": "Dec", "gpa": round(prev_gpa, 2), "test_score": round(test_score, 1)},
                {"month": "Jan", "gpa": round(min(4.0, prev_gpa + 0.1), 2), "test_score": round(min(100.0, test_score + 1), 1)},
                {"month": "Feb", "gpa": round(prev_gpa, 2), "test_score": round(test_score, 1)},
                {"month": "Mar", "gpa": round(min(4.0, prev_gpa + 0.1), 2), "test_score": round(min(100.0, test_score + 2), 1)}
            ]
            att_hist = [
                {"month": "Nov", "attendance": round(attendance, 1)},
                {"month": "Dec", "attendance": round(attendance, 1)},
                {"month": "Jan", "attendance": round(min(100.0, attendance + 1), 1)},
                {"month": "Feb", "attendance": round(attendance, 1)},
                {"month": "Mar", "attendance": round(min(100.0, attendance + 1), 1)}
            ]

        # Calculate formula risk & factors
        risk_score, risk_level, key_factors, _ = calculate_formula_risk(
            previous_gpa=prev_gpa,
            test_score=test_score,
            attendance_percentage=attendance,
            assignment_completion=assignment_comp,
            lms_login_frequency=lms_logins,
            class_participation=participation,
            behavior_score=behavior
        )

        students.append({
            "student_id": student_id,
            "name": name,
            "age": age,
            "grade": grade,
            "gender": "Male" if idx % 2 == 0 else "Female",
            "previous_gpa": prev_gpa,
            "test_score": test_score,
            "attendance_percentage": attendance,
            "assignment_completion": assignment_comp,
            "lms_login_frequency": lms_logins,
            "class_participation": participation,
            "behavior_score": behavior,
            "risk_score": risk_score,
            "risk_level": risk_level,
            "risk_factors": key_factors,
            "academic_history": acad_hist,
            "attendance_history": att_hist
        })

    return students

def seed_database_and_export_csv(db: Session, base_dir: str):
    """
    Checks if database is empty. If empty, seeds demo students, alerts, recommendations, user.
    Also exports dataset to data/students.csv.
    """
    data_dir = os.path.join(base_dir, "data")
    os.makedirs(data_dir, exist_ok=True)
    csv_path = os.path.join(data_dir, "students.csv")

    student_count = db.query(Student).count()
    student_records = generate_fictional_student_dataset(75)

    # Export to CSV for ML model training and external reference
    df = pd.DataFrame(student_records)
    csv_df = df.drop(columns=["academic_history", "attendance_history", "risk_factors"], errors="ignore")
    csv_df.to_csv(csv_path, index=False)
    print(f"[DataService] Exported {len(csv_df)} student records to {csv_path}")

    # 1. Seed Demo Teacher User if not already present
    existing_user = db.query(User).filter(User.email == "teacher@example.com").first()
    if not existing_user:
        demo_user = User(
            email="teacher@example.com",
            hashed_password="teacher123",
            full_name="Dr. Eleanor Vance",
            role="Head Teacher / Counselor"
        )
        db.add(demo_user)
        db.commit()

    if student_count == 0:
        print("[DataService] Database is empty. Seeding initial dataset...")

        for item in student_records:
            student = Student(
                student_id=item["student_id"],
                name=item["name"],
                age=item["age"],
                grade=item["grade"],
                gender=item["gender"],
                previous_gpa=item["previous_gpa"],
                test_score=item["test_score"],
                attendance_percentage=item["attendance_percentage"],
                assignment_completion=item["assignment_completion"],
                lms_login_frequency=item["lms_login_frequency"],
                class_participation=item["class_participation"],
                behavior_score=item["behavior_score"],
                risk_score=item["risk_score"],
                risk_level=item["risk_level"],
                risk_factors=item["risk_factors"],
                academic_history=item["academic_history"],
                attendance_history=item["attendance_history"]
            )
            db.add(student)

            # Generate Alert for High & Medium risk
            if item["risk_level"] in ["High", "Medium"]:
                title = f"{item['risk_level'].upper()} RISK: {item['name']} requires attention ({item['risk_score']:.1f}%)"
                message = f"{item['name']} from {item['grade']} has a risk score of {item['risk_score']:.1f}%. Primary concerns: {', '.join(item['risk_factors'][:2])}"
                alert = Alert(
                    student_id=item["student_id"],
                    student_name=item["name"],
                    risk_level=item["risk_level"],
                    risk_score=item["risk_score"],
                    title=title,
                    message=message,
                    reasons=item["risk_factors"],
                    status="New" if item["risk_level"] == "High" else "Reviewed"
                )
                db.add(alert)

            # Generate Recommendation for all students
            main_prob, intervention, priority, actions, action_plan = generate_recommendations(
                student_id=item["student_id"],
                name=item["name"],
                risk_level=item["risk_level"],
                risk_score=item["risk_score"],
                attendance_percentage=item["attendance_percentage"],
                previous_gpa=item["previous_gpa"],
                test_score=item["test_score"],
                assignment_completion=item["assignment_completion"],
                lms_login_frequency=item["lms_login_frequency"],
                class_participation=item["class_participation"],
                behavior_score=item["behavior_score"]
            )
            rec = Recommendation(
                student_id=item["student_id"],
                student_name=item["name"],
                risk_level=item["risk_level"],
                risk_score=item["risk_score"],
                main_problem=main_prob,
                recommended_intervention=intervention,
                priority=priority,
                status="Pending" if priority == "Urgent" else ("In Progress" if priority == "High" else "Completed"),
                action_plan=action_plan
            )
            db.add(rec)

        db.commit()
        print(f"[DataService] Successfully seeded {len(student_records)} students into database.")
