from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.services.ml_service import MLService, detector


class MLController:
    @staticmethod
    async def trigger_retraining(db: AsyncSession) -> dict:
        success = await MLService.retrain_on_historical_data(db)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Retraining failed. Check logs for details. Make sure you have at least 10 transaction records."
            )
        return {"status": "success", "message": "ML model retraining completed successfully."}

    @staticmethod
    def get_status() -> dict:
        return {
            "model_type": "IsolationForest",
            "is_fitted": detector.is_fitted,
            "contamination": detector.model.contamination,
            "n_estimators": detector.model.n_estimators
        }
