import datetime
from typing import Dict, Any
from pydantic import BaseModel, ConfigDict, Field


class RiskScoreBase(BaseModel):
    entity_type: str = Field(..., max_length=50, examples=["ip"])
    entity_id: str = Field(..., max_length=100, examples=["192.168.1.99"])
    score: float = Field(..., ge=0.0, le=100.0, examples=[82.5])
    factors_json: Dict[str, Any] = Field(default_factory=dict, examples=[{"has_failed_logins": True, "high_volume_transfers": False}])


class RiskScoreCreate(RiskScoreBase):
    pass


class RiskScore(RiskScoreBase):
    id: int
    timestamp: datetime.datetime

    model_config = ConfigDict(from_attributes=True)
