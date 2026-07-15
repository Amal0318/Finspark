from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import Dict, Any

from app.models.user import User
from app.models.telemetry import TelemetryLog
from app.models.transaction import BankingTransaction
from app.models.alert import CorrelatedAlert
from app.models.threat_report import ThreatReport


class DashboardService:
    @staticmethod
    async def get_summary_metrics(db: AsyncSession) -> Dict[str, Any]:
        """
        Gathers dashboard metrics: total logs, transactions, alert states,
        and derives a Security Posture Index.
        """
        # Execute counts asynchronously
        tx_count_result = await db.execute(select(func.count(BankingTransaction.id)))
        tx_count = tx_count_result.scalar() or 0

        telemetry_count_result = await db.execute(select(func.count(TelemetryLog.id)))
        telemetry_count = telemetry_count_result.scalar() or 0

        alerts_count_result = await db.execute(select(func.count(CorrelatedAlert.id)))
        alerts_count = alerts_count_result.scalar() or 0

        # Query alert statuses
        open_alerts_res = await db.execute(
            select(func.count(CorrelatedAlert.id)).where(CorrelatedAlert.status == "OPEN")
        )
        open_alerts = open_alerts_res.scalar() or 0

        investigating_res = await db.execute(
            select(func.count(CorrelatedAlert.id)).where(CorrelatedAlert.status == "INVESTIGATING")
        )
        investigating_alerts = investigating_res.scalar() or 0

        resolved_res = await db.execute(
            select(func.count(CorrelatedAlert.id)).where(CorrelatedAlert.status == "RESOLVED")
        )
        resolved_alerts = resolved_res.scalar() or 0

        # Retrieve highest severity logs
        critical_logs_res = await db.execute(
            select(func.count(TelemetryLog.id)).where(TelemetryLog.severity == "CRITICAL")
        )
        critical_logs = critical_logs_res.scalar() or 0

        high_logs_res = await db.execute(
            select(func.count(TelemetryLog.id)).where(TelemetryLog.severity == "HIGH")
        )
        high_logs = high_logs_res.scalar() or 0

        medium_logs_res = await db.execute(
            select(func.count(TelemetryLog.id)).where(TelemetryLog.severity == "MEDIUM")
        )
        medium_logs = medium_logs_res.scalar() or 0

        # Calculate a mock Security Posture Index (SPI)
        # Higher count of open anomalies decreases the index
        base_spi = 100.0
        deduction = (open_alerts * 10) + (investigating_alerts * 5) + (critical_logs * 2) + (high_logs * 0.5)
        security_posture_index = max(10.0, min(100.0, base_spi - deduction))

        # Recent alerts query
        recent_alerts_stmt = select(CorrelatedAlert).order_by(CorrelatedAlert.timestamp.desc()).limit(5)
        recent_alerts_result = await db.execute(recent_alerts_stmt)
        recent_alerts = list(recent_alerts_result.scalars().all())

        # Recent threat intel feeds
        recent_feeds_stmt = select(ThreatReport).order_by(ThreatReport.timestamp.desc()).limit(5)
        recent_feeds_result = await db.execute(recent_feeds_stmt)
        recent_feeds = list(recent_feeds_result.scalars().all())

        return {
            "transactions_count": tx_count,
            "telemetry_logs_count": telemetry_count,
            "total_alerts": alerts_count,
            "open_alerts": open_alerts,
            "investigating_alerts": investigating_alerts,
            "resolved_alerts": resolved_alerts,
            "security_posture_index": round(security_posture_index, 1),
            "recent_alerts_count": len(recent_alerts),
            "recent_threat_reports_count": len(recent_feeds),
        }
