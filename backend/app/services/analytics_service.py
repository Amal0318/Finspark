from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, case
from typing import Dict, Any, List

from app.models.alert import CorrelatedAlert
from app.models.telemetry import TelemetryLog
from app.models.transaction import BankingTransaction


class AnalyticsService:
    @staticmethod
    async def get_correlation_trends(db: AsyncSession) -> Dict[str, Any]:
        """
        Gathers analytical intelligence: alert categories distribution,
        telemetry severity, transaction amount classifications.
        """
        # 1. Alert distribution by status
        status_stmt = select(
            CorrelatedAlert.status, 
            func.count(CorrelatedAlert.id)
        ).group_by(CorrelatedAlert.status)
        status_res = await db.execute(status_stmt)
        alerts_by_status = {r[0]: r[1] for r in status_res.all()}

        # 2. Telemetry logs distribution by severity
        severity_stmt = select(
            TelemetryLog.severity, 
            func.count(TelemetryLog.id)
        ).group_by(TelemetryLog.severity)
        severity_res = await db.execute(severity_stmt)
        logs_by_severity = {r[0]: r[1] for r in severity_res.all()}

        # 3. Transaction size distribution buckets
        # amount buckets: < 100 (micro), 100 - 1000 (standard), 1000 - 10000 (high), 10000+ (critical)
        amt_case = case(
            (BankingTransaction.amount < 100, "micro"),
            (BankingTransaction.amount.between(100, 1000), "standard"),
            (BankingTransaction.amount.between(1000, 10000), "high"),
            else_="critical"
        )
        tx_dist_stmt = select(amt_case, func.count(BankingTransaction.id)).group_by(amt_case)
        tx_dist_res = await db.execute(tx_dist_stmt)
        transaction_distribution = {r[0]: r[1] for r in tx_dist_res.all()}

        # Ensure all buckets are initialized in dict
        for bucket in ["micro", "standard", "high", "critical"]:
            if bucket not in transaction_distribution:
                transaction_distribution[bucket] = 0

        # 4. Hourly anomaly correlation rate
        # Groups alerts by the hour they occurred (last 24 hours trend proxy)
        hourly_stmt = select(
            func.cast(func.extract('hour', CorrelatedAlert.timestamp), func.Integer).label('hour'),
            func.count(CorrelatedAlert.id).label('count')
        ).group_by('hour').order_by('hour')
        
        hourly_res = await db.execute(hourly_stmt)
        hourly_alerts = [{"hour": r[0], "alerts_count": r[1]} for r in hourly_res.all()]

        return {
            "alerts_by_status": alerts_by_status,
            "logs_by_severity": logs_by_severity,
            "transaction_distribution": transaction_distribution,
            "hourly_alert_trends": hourly_alerts
        }
