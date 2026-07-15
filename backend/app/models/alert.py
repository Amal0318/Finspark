import datetime
from sqlalchemy import String, DateTime, Float, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class CorrelatedAlert(Base):
    __tablename__ = "correlated_alerts"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    timestamp: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
        index=True
    )
    
    telemetry_log_id: Mapped[int] = mapped_column(ForeignKey("telemetry_logs.id", ondelete="CASCADE"), nullable=True)
    banking_transaction_id: Mapped[int] = mapped_column(ForeignKey("banking_transactions.id", ondelete="CASCADE"), nullable=True)
    
    correlation_reason: Mapped[str] = mapped_column(String(255), nullable=False)
    risk_score: Mapped[float] = mapped_column(Float, default=0.0, index=True) # 0.0 to 100.0 or 0.0 to 1.0
    status: Mapped[str] = mapped_column(String(20), default="OPEN", index=True) # OPEN, INVESTIGATING, RESOLVED, FALSE_POSITIVE
    notes: Mapped[str] = mapped_column(Text, nullable=True)

    # Relationships
    telemetry_log: Mapped["TelemetryLog"] = relationship("TelemetryLog", foreign_keys=[telemetry_log_id])
    banking_transaction: Mapped["BankingTransaction"] = relationship("BankingTransaction", foreign_keys=[banking_transaction_id])
