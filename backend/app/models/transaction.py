import datetime
from sqlalchemy import String, DateTime, Numeric, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class BankingTransaction(Base):
    __tablename__ = "banking_transactions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    timestamp: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
        index=True
    )
    sender_account: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    receiver_account: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)
    transaction_type: Mapped[str] = mapped_column(String(20), nullable=False) # e.g., transfer, withdrawal, deposit
    location: Mapped[str] = mapped_column(String(100), nullable=True)
    ip_address: Mapped[str] = mapped_column(String(45), index=True, nullable=False) # Linked to telemetry source_ip!
    device_fingerprint: Mapped[str] = mapped_column(String(100), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="COMPLETED", nullable=False) # PENDING, COMPLETED, FAILED
    is_flagged: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
