from typing import List, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.risk_service import RiskService


class RiskController:
    @staticmethod
    async def evaluate(
        db: AsyncSession, 
        entity_type: str, 
        entity_id: str
    ) -> Any:
        return await RiskService.evaluate_entity_risk(db, entity_type, entity_id)

    @staticmethod
    async def get_history(
        db: AsyncSession, 
        entity_type: str, 
        entity_id: str, 
        limit: int = 10
    ) -> List[Any]:
        return await RiskService.get_risk_history(db, entity_type, entity_id, limit)
