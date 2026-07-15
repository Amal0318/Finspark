import datetime
from sqlalchemy import String, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class TelemetryLog(Base):
    __tablename__ = "telemetry_logs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    timestamp: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.datetime.now(datetime.timezone.utc), 
        index=True
    )
    device_id: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    source_ip: Mapped[str] = mapped_column(String(45), index=True, nullable=False)
    destination_ip: Mapped[str] = mapped_column(String(45), nullable=True)
    event_type: Mapped[str] = mapped_column(String(50), index=True, nullable=False) # e.g., login_failed, port_scan, sql_injection, normal
    severity: Mapped[str] = mapped_column(String(15), nullable=False) # LOW, MEDIUM, HIGH, CRITICAL
    description: Mapped[str] = mapped_column(Text, nullable=True)
