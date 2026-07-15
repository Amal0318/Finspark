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
        # 1. Create the transaction record
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
        await db.flush() # Flushes to get the transaction ID
        
        # 2. Correlate with cybersecurity telemetry logs
        # Check logs within +/- 10 minutes of the transaction from the same IP
        concurrent_logs = await TelemetryService.get_concurrent_threats(
            db=db,
            ip_address=db_obj.ip_address,
            tx_time=db_obj.timestamp,
            window_minutes=10
        )
        
        # 3. Assess threat score using the Machine Learning service
        # Translate models to dictionaries for ML input
        tx_dict = {
            "amount": db_obj.amount,
            "timestamp": db_obj.timestamp
        }
        logs_dicts = [
            {"severity": log.severity, "event_type": log.event_type}
            for log in concurrent_logs
        ]
        
        risk_score = MLService.evaluate_transaction_risk(tx_dict, logs_dicts)
        
        # 4. Trigger alert system if risk threshold is exceeded
        # Scores > 60.0 represent significant anomaly correlations
        if risk_score >= 60.0 or len(concurrent_logs) > 0:
            db_obj.is_flagged = True
            
            # Map the alert to the highest severity log if available
            highest_sev_log_id = None
            if concurrent_logs:
                # Sort by severity value: CRITICAL, HIGH, MEDIUM, LOW
                sev_order = {"CRITICAL": 4, "HIGH": 3, "MEDIUM": 2, "LOW": 1}
                sorted_logs = sorted(
                    concurrent_logs, 
                    key=lambda x: sev_order.get(x.severity.upper(), 0), 
                    reverse=True
                )
                highest_sev_log_id = sorted_logs[0].id
            
            # Define correlation reason
            reason = ""
            if len(concurrent_logs) > 0:
                reason = f"Correlated cybersecurity threat ({concurrent_logs[0].event_type}) detected from transaction IP. "
            if risk_score >= 60.0:
                reason += f"ML Anomaly Risk: {risk_score}%."
            else:
                reason += "Rules engine flag."
                
            alert_obj = CorrelatedAlert(
                telemetry_log_id=highest_sev_log_id,
                banking_transaction_id=db_obj.id,
                correlation_reason=reason,
                risk_score=risk_score,
                status="OPEN",
                notes=f"Correlated transaction amount ${db_obj.amount:.2f} with concurrent security events."
            )
            db.add(alert_obj)

        await db.commit()
        await db.refresh(db_obj)
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
