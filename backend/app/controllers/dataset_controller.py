from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import UploadFile
from app.services.dataset_service import DatasetService


class DatasetController:
    @staticmethod
    async def upload_transactions(db: AsyncSession, file: UploadFile) -> dict:
        return await DatasetService.process_transaction_csv(db, file)

    @staticmethod
    async def upload_telemetry(db: AsyncSession, file: UploadFile) -> dict:
        return await DatasetService.process_telemetry_csv(db, file)
