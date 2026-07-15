import datetime
from sqlalchemy import String, DateTime, Float, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class RiskScore(Base):
    __tablename__ = "risk_scores"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    entity_type: Mapped[str] = mapped_column(String(50), index=True, nullable=False) # e.g. ip, account, user
    entity_id: Mapped[str] = mapped_column(String(100), index=True, nullable=False) # e.g. "192.168.1.99" or "ACC-12345"
    score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    factors_json: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False) # Detailed risk factors explanation
    timestamp: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
        index=True
    )
