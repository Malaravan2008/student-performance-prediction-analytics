import os
import sys

# Add backend directory to sys.path
backend_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend")
sys.path.insert(0, backend_dir)

from app.database.session import Base, engine, SessionLocal
from app.services.data_service import seed_database_and_export_csv
from app.ml.train import train_and_evaluate_models
from app.ml.predictor import predict_student_risk
from app.schemas.prediction import PredictRequest
from app.models.student import Student

def run_tests():
    print("=== Testing Database Initialization ===")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    seed_database_and_export_csv(db, root_dir)

    student_count = db.query(Student).count()
    print(f"Total students in DB: {student_count}")
    assert student_count > 0, "No students seeded!"

    print("\n=== Testing Machine Learning Pipeline ===")
    metrics = train_and_evaluate_models()
    print(f"Selected Best Model: {metrics['selected_model']}")
    for bm in metrics["benchmarks"]:
        print(f" - {bm['model_name']}: Accuracy={bm['accuracy']}, F1={bm['f1_score']}")

    print("\n=== Testing Predictor for Low, Medium, and High Risk Profiles ===")
    
    # 1. High Risk Student
    high_req = PredictRequest(
        student_id="TEST-HIGH",
        student_name="Test High Risk Student",
        previous_gpa=1.8,
        test_score=45.0,
        attendance_percentage=55.0,
        assignment_completion=48.0,
        lms_login_frequency=3.0,
        class_participation=40.0,
        behavior_score=60.0
    )
    high_res = predict_student_risk(high_req)
    print(f"High Risk Profile -> Score: {high_res.risk_score}, Level: {high_res.risk_level}, Actions: {len(high_res.recommended_actions)}")
    assert high_res.risk_level == "High", f"Expected High, got {high_res.risk_level}"

    # 2. Medium Risk Student
    med_req = PredictRequest(
        student_id="TEST-MED",
        student_name="Test Medium Risk Student",
        previous_gpa=2.8,
        test_score=68.0,
        attendance_percentage=78.0,
        assignment_completion=72.0,
        lms_login_frequency=10.0,
        class_participation=65.0,
        behavior_score=80.0
    )
    med_res = predict_student_risk(med_req)
    print(f"Medium Risk Profile -> Score: {med_res.risk_score}, Level: {med_res.risk_level}")
    assert med_res.risk_level == "Medium", f"Expected Medium, got {med_res.risk_level}"

    # 3. Low Risk Student
    low_req = PredictRequest(
        student_id="TEST-LOW",
        student_name="Test Low Risk Student",
        previous_gpa=3.8,
        test_score=92.0,
        attendance_percentage=96.0,
        assignment_completion=95.0,
        lms_login_frequency=22.0,
        class_participation=90.0,
        behavior_score=95.0
    )
    low_res = predict_student_risk(low_req)
    print(f"Low Risk Profile -> Score: {low_res.risk_score}, Level: {low_res.risk_level}")
    assert low_res.risk_level == "Low", f"Expected Low, got {low_res.risk_level}"

    print("\nALL BACKEND & ML TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
