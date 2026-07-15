import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import Dict, Any, List

from app.models.risk_score import RiskScore
from app.models.telemetry import TelemetryLog
from app.models.transaction import BankingTransaction
from app.utils.logger import logger


class RiskService:
    @staticmethod
    async def evaluate_entity_risk(
        db: AsyncSession, 
        entity_type: str, 
        entity_id: str
    ) -> RiskScore:
        """
        Gathers risk signals for an entity (IP or account) from telemetry logs
        and transaction histories, saves, and returns a RiskScore record.
        """
        score = 0.0
        factors = {}

        if entity_type == "ip":
            # 1. Check cyber threat logs from this IP
            logs_res = await db.execute(
                select(TelemetryLog).where(TelemetryLog.source_ip == entity_id)
            )
            logs = logs_res.scalars().all()
            
            logs_count = len(logs)
            factors["logs_count"] = logs_count
            
            if logs_count > 0:
                score += min(30.0, logs_count * 5.0)
                
                # Check max severity
                max_sev = "LOW"
                sev_weights = {"LOW": 5.0, "MEDIUM": 15.0, "HIGH": 30.0, "CRITICAL": 50.0}
                max_sev_weight = 0.0
                for log in logs:
                    weight = sev_weights.get(log.severity.upper(), 0.0)
                    if weight > max_sev_weight:
                        max_sev_weight = weight
                        max_sev = log.severity
                score += max_sev_weight
                factors["max_telemetry_severity"] = max_sev
            
            # 2. Check transactions from this IP
            txs_res = await db.execute(
                select(BankingTransaction).where(BankingTransaction.ip_address == entity_id)
            )
            txs = txs_res.scalars().all()
            factors["transaction_count"] = len(txs)
            
            flagged_txs = len([t for t in txs if t.is_flagged])
            factors["flagged_transaction_count"] = flagged_txs
            if flagged_txs > 0:
                score += flagged_txs * 25.0
                
        elif entity_type == "account":
            # Check transactions where account is sender
            txs_res = await db.execute(
                select(BankingTransaction).where(
                    (BankingTransaction.sender_account == entity_id) | 
                    (BankingTransaction.receiver_account == entity_id)
                )
            )
            txs = txs_res.scalars().all()
            
            tx_count = len(txs)
            factors["transaction_count"] = tx_count
            
            flagged_txs = len([t for t in txs if t.is_flagged])
            factors["flagged_transaction_count"] = flagged_txs
            
            if flagged_txs > 0:
                score += flagged_txs * 30.0
                
            # Check high amount transfers
            high_amt_txs = len([t for t in txs if t.amount > 10000.0])
            factors["high_value_transfers_count"] = high_amt_txs
            if high_amt_txs > 0:
                score += min(20.0, high_amt_txs * 10.0)
                
        else:
            # Default fallback for users or other types
            score = 10.0
            factors["reason"] = "Default fallback risk profile applied"

        # Final bound check (0.0 to 100.0)
        score = float(min(100.0, max(0.0, score)))

        # Log risk score
        risk_record = RiskScore(
            entity_type=entity_type,
            entity_id=entity_id,
            score=round(score, 2),
            factors_json=factors
        )
        db.add(risk_record)
        await db.commit()
        await db.refresh(risk_record)
        
        logger.info(f"Assessed threat risk for entity {entity_type}/{entity_id}: Score {score}%")
        return risk_record

    @staticmethod
    async def get_risk_history(
        db: AsyncSession, 
        entity_type: str, 
        entity_id: str, 
        limit: int = 10
    ) -> List[RiskScore]:
        from sqlalchemy import desc
        
        result = await db.execute(
            select(RiskScore)
            .where((RiskScore.entity_type == entity_type) & (RiskScore.entity_id == entity_id))
            .order_by(desc(RiskScore.timestamp))
            .limit(limit)
        )
        return list(result.scalars().all())
