from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.core.database import get_db
from app.controllers.prediction_controller import PredictionController
from app.middleware.auth import RoleChecker
from app.models.user import User
from app.schemas.prediction import MlPrediction as MlPredictionSchema

router = APIRouter(prefix="/predictions")

# Allow admins and investigators to execute predictions
analyst_only = RoleChecker(allowed_roles=["admin", "investigator"])


class PredictionRequest(BaseModel):
    transaction: Dict[str, Any]
    concurrent_logs: List[Dict[str, Any]]


@router.post("/classify")
async def classify_transaction(
    request: PredictionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(analyst_only)
):
    """
    Run custom transaction features classification and output anomaly results.
    """
    return await PredictionController.classify(
        db, 
        request.transaction, 
        request.concurrent_logs
    )


@router.get("/history", response_model=List[MlPredictionSchema])
async def get_predictions_history(
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(analyst_only)
):
    """
    Query historical log executions of the ML anomaly classifier.
    """
    return await PredictionController.get_history(db, limit)
