import datetime
from sqlalchemy import String, DateTime, Float, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class MlPrediction(Base):
    __tablename__ = "ml_predictions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    model_name: Mapped[str] = mapped_column(String(100), default="IsolationForest", nullable=False)
    input_features_json: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    output_label: Mapped[str] = mapped_column(String(50), nullable=False) # e.g. anomalous, normal
    confidence: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    timestamp: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
        index=True
    )
