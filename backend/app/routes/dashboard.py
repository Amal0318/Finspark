from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.controllers.dashboard_controller import DashboardController
from app.middleware.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/dashboard")


@router.get("/summary")
async def get_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns dashboard overview statistics, alerts counts,
    and Security Posture Index.
    """
    return await DashboardController.get_summary(db)
