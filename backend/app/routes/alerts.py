from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database.session import get_db
from app.models.alert import Alert
from app.schemas.alert import AlertResponse, AlertStatusUpdate, AlertStatsResponse

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("", response_model=List[AlertResponse])
def get_alerts(
    risk_level: Optional[str] = Query(None, description="Filter by Low, Medium, High"),
    status: Optional[str] = Query(None, description="Filter by New, Reviewed, Resolved"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(Alert)

    if risk_level and risk_level.lower() != "all":
        query = query.filter(Alert.risk_level.ilike(risk_level))

    if status and status.lower() != "all":
        query = query.filter(Alert.status.ilike(status))

    alerts = query.order_by(desc(Alert.created_at)).offset(skip).limit(limit).all()
    return alerts

@router.get("/stats", response_model=AlertStatsResponse)
def get_alert_stats(db: Session = Depends(get_db)):
    total = db.query(Alert).count()
    new_c = db.query(Alert).filter(Alert.status == "New").count()
    rev_c = db.query(Alert).filter(Alert.status == "Reviewed").count()
    res_c = db.query(Alert).filter(Alert.status == "Resolved").count()
    high_c = db.query(Alert).filter(Alert.risk_level == "High").count()

    return AlertStatsResponse(
        total_alerts=total,
        new_alerts=new_c,
        reviewed_alerts=rev_c,
        resolved_alerts=res_c,
        high_risk_alerts=high_c
    )

@router.patch("/{alert_id}/status", response_model=AlertResponse)
def update_alert_status_endpoint(
    alert_id: int,
    status_update: AlertStatusUpdate,
    db: Session = Depends(get_db)
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.status = status_update.status
    db.commit()
    db.refresh(alert)
    return alert
