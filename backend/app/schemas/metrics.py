from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class ModelPerformance(BaseModel):
    model_name: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    is_best: bool = False

class ModelMetricsResponse(BaseModel):
    selected_model: str
    dataset_size: int
    train_size: int
    test_size: int
    features: List[str]
    target: str
    feature_importance: Dict[str, float]
    benchmarks: List[ModelPerformance]
    trained_at: str
    data_source_label: str = "Prototype Benchmark Dataset (Synthetic Fictional Cohort)"

class DashboardSummaryResponse(BaseModel):
    total_students: int
    low_risk_count: int
    medium_risk_count: int
    high_risk_count: int
    average_attendance: float
    average_gpa: float
    average_test_score: float
    average_engagement: float
    total_alerts: int
    pending_recommendations: int
    risk_distribution: Dict[str, int]
    performance_trends: List[Dict[str, Any]]
    attendance_vs_performance: List[Dict[str, Any]]
    risk_factor_distribution: Dict[str, int]
