from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.telemetry import TelemetryLogCreate, TelemetryLogResponse
from app.services.telemetry_service import TelemetryService


class TelemetryController:
    @staticmethod
    async def create_log(
        db: AsyncSession, log_in: TelemetryLogCreate
    ) -> TelemetryLogResponse:
        db_obj = await TelemetryService.create(db, log_in)
        return TelemetryLogResponse.model_validate(db_obj)

    @staticmethod
    async def get_logs(
        db: AsyncSession, skip: int = 0, limit: int = 100
    ) -> List[TelemetryLogResponse]:
        db_objs = await TelemetryService.get_multi(db, skip, limit)
        return [TelemetryLogResponse.model_validate(obj) for obj in db_objs]
