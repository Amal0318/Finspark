import datetime
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
from app.models.transaction import BankingTransaction
from app.models.alert import CorrelatedAlert
from app.schemas.transaction import BankingTransactionCreate
from app.services.telemetry_service import TelemetryService
from app.services.ml_service import MLService


class TransactionService:
    @staticmethod
    async def create(db: AsyncSession, obj_in: BankingTransactionCreate) -> BankingTransaction:
        # 1. Create the transaction record and save it to SQL immediately
        db_obj = BankingTransaction(
            sender_account=obj_in.sender_account,
            receiver_account=obj_in.receiver_account,
            amount=obj_in.amount,
            currency=obj_in.currency,
            transaction_type=obj_in.transaction_type,
            location=obj_in.location,
            ip_address=obj_in.ip_address,
            device_fingerprint=obj_in.device_fingerprint,
            status=obj_in.status,
            is_flagged=False
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        
        # 2. Publish to Kafka topic for async security log correlation & ML audit evaluation
        from app.services.kafka import send_transaction_event
        import asyncio
        
        event_payload = {
            "id": db_obj.id,
            "sender_account": db_obj.sender_account,
            "receiver_account": db_obj.receiver_account,
            "amount": float(db_obj.amount),
            "currency": db_obj.currency,
            "transaction_type": db_obj.transaction_type,
            "location": db_obj.location,
            "ip_address": db_obj.ip_address,
            "device_fingerprint": db_obj.device_fingerprint,
            "status": db_obj.status,
            "timestamp": db_obj.timestamp.isoformat() if db_obj.timestamp else None
        }
        
        # Spawn asynchronous producer call
        asyncio.create_task(send_transaction_event(event_payload))
        
        return db_obj

    @staticmethod
    async def get_multi(
        db: AsyncSession, skip: int = 0, limit: int = 100
    ) -> List[BankingTransaction]:
        result = await db.execute(
            select(BankingTransaction)
            .order_by(desc(BankingTransaction.timestamp))
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_by_id(db: AsyncSession, tx_id: int) -> Optional[BankingTransaction]:
        result = await db.execute(
            select(BankingTransaction).where(BankingTransaction.id == tx_id)
        )
        return result.scalars().first()
