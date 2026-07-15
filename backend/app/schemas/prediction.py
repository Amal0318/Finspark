import datetime
from typing import Dict, Any
from pydantic import BaseModel, ConfigDict, Field


class MlPredictionBase(BaseModel):
    model_name: str = Field("IsolationForest", max_length=100, examples=["IsolationForest"])
    input_features_json: Dict[str, Any] = Field(default_factory=dict, examples=[{"amount": 1500.0, "failed_logins": 2}])
    output_label: str = Field(..., max_length=50, examples=["anomalous"])
    confidence: float = Field(1.0, ge=0.0, le=1.0, examples=[0.92])


class MlPredictionCreate(MlPredictionBase):
    pass


class MlPrediction(MlPredictionBase):
    id: int
    timestamp: datetime.datetime

    model_config = ConfigDict(from_attributes=True)
