from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.controllers.telemetry_controller import TelemetryController
from app.middleware.auth import get_current_user
from app.schemas.telemetry import TelemetryLogCreate, TelemetryLogResponse
from app.models.user import User

router = APIRouter(prefix="/telemetry")


@router.post("", response_model=TelemetryLogResponse)
async def create_telemetry_log(
    log_in: TelemetryLogCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await TelemetryController.create_log(db, log_in)


@router.get("", response_model=List[TelemetryLogResponse])
async def list_telemetry_logs(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await TelemetryController.get_logs(db, skip=skip, limit=limit)
