from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.prediction_service import PredictionService


class PredictionController:
    @staticmethod
    async def classify(
        db: AsyncSession, 
        transaction: Dict[str, Any], 
        concurrent_logs: List[Dict[str, Any]]
    ) -> dict:
        return await PredictionService.classify_transaction(db, transaction, concurrent_logs)

    @staticmethod
    async def get_history(db: AsyncSession, limit: int = 100) -> List[Any]:
        return await PredictionService.get_history(db, limit)
