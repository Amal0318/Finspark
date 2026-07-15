from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.controllers.analytics_controller import AnalyticsController
from app.middleware.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/analytics")


@router.get("/trends")
async def get_trends(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Query system analytics: log distributions, transaction classifications,
    and alert timelines.
    """
    return await AnalyticsController.get_trends(db)
