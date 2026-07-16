from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.controllers.risk_controller import RiskController
from app.middleware.auth import RoleChecker, get_current_user
from app.models.user import User
from app.schemas.risk_score import RiskScore as RiskScoreSchema

router = APIRouter(prefix="/risk-scores")

# Restrict scoring modifications to administrative or investigation profiles
analyst_only = RoleChecker(allowed_roles=["admin", "investigator"])


@router.post("/evaluate", response_model=RiskScoreSchema)
async def evaluate_entity_risk(
    entity_type: str = Query(..., description="Entity type: ip or account"),
    entity_id: str = Query(..., description="Unique entity identifier"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(analyst_only)
):
    """
    Triggers risk score calculation and logs factors list.
    """
    return await RiskController.evaluate(db, entity_type, entity_id)


@router.get("/history", response_model=List[RiskScoreSchema])
async def get_entity_risk_history(
    entity_type: str = Query(..., description="Entity type: ip or account"),
    entity_id: str = Query(..., description="Unique entity identifier"),
    limit: int = 10,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Fetch historical risk logs generated for a specific network IP or banking account.
    """
    return await RiskController.get_history(db, entity_type, entity_id, limit)
