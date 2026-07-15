from sqlalchemy.ext.asyncio import AsyncSession
from app.services.dashboard_service import DashboardService


class DashboardController:
    @staticmethod
    async def get_summary(db: AsyncSession) -> dict:
        return await DashboardService.get_summary_metrics(db)
