from sqlalchemy.ext.asyncio import AsyncSession
from app.services.analytics_service import AnalyticsService


class AnalyticsController:
    @staticmethod
    async def get_trends(db: AsyncSession) -> dict:
        return await AnalyticsService.get_correlation_trends(db)
