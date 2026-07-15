from sqlalchemy.ext.asyncio import AsyncSession
from app.services.llm_service import LLMService


class LLMController:
    @staticmethod
    async def explain_correlation(db: AsyncSession, alert_id: int) -> dict:
        return await LLMService.narrate_correlation_incident(db, alert_id)
