import datetime
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, desc
from app.models.telemetry import TelemetryLog
from app.schemas.telemetry import TelemetryLogCreate


class TelemetryService:
    @staticmethod
    async def create(db: AsyncSession, obj_in: TelemetryLogCreate) -> TelemetryLog:
        db_obj = TelemetryLog(
            device_id=obj_in.device_id,
            source_ip=obj_in.source_ip,
            destination_ip=obj_in.destination_ip,
            event_type=obj_in.event_type,
            severity=obj_in.severity,
            description=obj_in.description
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    @staticmethod
    async def get_multi(
        db: AsyncSession, skip: int = 0, limit: int = 100
    ) -> List[TelemetryLog]:
        result = await db.execute(
            select(TelemetryLog)
            .order_by(desc(TelemetryLog.timestamp))
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_concurrent_threats(
        db: AsyncSession, 
        ip_address: str, 
        tx_time: datetime.datetime, 
        window_minutes: int = 10
    ) -> List[TelemetryLog]:
        """
        Retrieves telemetry security logs originating from the same IP address
        within a specific time window surrounding the transaction time.
        """
        start_window = tx_time - datetime.timedelta(minutes=window_minutes)
        end_window = tx_time + datetime.timedelta(minutes=window_minutes)
        
        result = await db.execute(
            select(TelemetryLog).where(
                and_(
                    TelemetryLog.source_ip == ip_address,
                    TelemetryLog.timestamp >= start_window,
                    TelemetryLog.timestamp <= end_window
                )
            )
        )
        return list(result.scalars().all())
