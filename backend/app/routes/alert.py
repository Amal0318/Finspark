from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import desc

from app.core.database import get_db
from app.controllers.ml_controller import MLController
from app.middleware.auth import get_current_user
from app.models.alert import CorrelatedAlert
from app.models.user import User
from app.schemas.alert import CorrelatedAlertResponse, CorrelatedAlertUpdate

router = APIRouter(prefix="/alerts")


@router.get("", response_model=List[CorrelatedAlertResponse])
async def list_alerts(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Fetch all correlated cybersecurity and transaction alerts.
    Eager-loads related transactions and telemetry logs.
    """
    result = await db.execute(
        select(CorrelatedAlert)
        .options(
            selectinload(CorrelatedAlert.telemetry_log),
            selectinload(CorrelatedAlert.banking_transaction)
        )
        .order_by(desc(CorrelatedAlert.timestamp))
        .offset(skip)
        .limit(limit)
    )
    return list(result.scalars().all())


@router.get("/{alert_id}", response_model=CorrelatedAlertResponse)
async def get_alert_by_id(
    alert_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(CorrelatedAlert)
        .options(
            selectinload(CorrelatedAlert.telemetry_log),
            selectinload(CorrelatedAlert.banking_transaction)
        )
        .where(CorrelatedAlert.id == alert_id)
    )
    alert = result.scalars().first()
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert with ID {alert_id} not found"
        )
    return alert


@router.put("/{alert_id}", response_model=CorrelatedAlertResponse)
async def update_alert(
    alert_id: int,
    alert_in: CorrelatedAlertUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update status or comments/notes of a correlated threat alert.
    """
    result = await db.execute(
        select(CorrelatedAlert)
        .options(
            selectinload(CorrelatedAlert.telemetry_log),
            selectinload(CorrelatedAlert.banking_transaction)
        )
        .where(CorrelatedAlert.id == alert_id)
    )
    alert = result.scalars().first()
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert with ID {alert_id} not found"
        )
        
    if alert_in.status is not None:
        alert.status = alert_in.status
    if alert_in.notes is not None:
        alert.notes = alert_in.notes
        
    await db.commit()
    await db.refresh(alert)
    return alert


@router.get("/ml/status", tags=["Machine Learning"])
def get_ml_status(
    current_user: User = Depends(get_current_user)
):
    """
    Query the status of the IsolationForest anomaly detection model.
    """
    return MLController.get_status()


@router.post("/ml/retrain", tags=["Machine Learning"])
async def trigger_ml_retraining(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Manually trigger retraining on historical telemetry and transaction records.
    """
    return await MLController.trigger_retraining(db)
