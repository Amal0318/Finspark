import datetime
from sqlalchemy import String, DateTime, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class ThreatReport(Base):
    __tablename__ = "threat_reports"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    source: Mapped[str] = mapped_column(String(100), index=True, nullable=False) # e.g. AlienVault, AbuseIP
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    severity: Mapped[str] = mapped_column(String(15), default="MEDIUM", nullable=False) # LOW, MEDIUM, HIGH, CRITICAL
    indicators_json: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False) # List of malicious IPs/domains
    timestamp: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
        index=True
    )
