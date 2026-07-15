import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class TelemetryLogBase(BaseModel):
    device_id: str = Field(..., max_length=100, examples=["desktop-01"])
    source_ip: str = Field(..., max_length=45, examples=["192.168.1.50"])
    destination_ip: Optional[str] = Field(None, max_length=45, examples=["10.0.0.1"])
    event_type: str = Field(..., max_length=50, examples=["login_failed"])
    severity: str = Field(..., max_length=15, examples=["HIGH"]) # LOW, MEDIUM, HIGH, CRITICAL
    description: Optional[str] = Field(None, examples=["Failed login attempt for user admin"])


class TelemetryLogCreate(TelemetryLogBase):
    pass


class TelemetryLog(TelemetryLogBase):
    id: int
    timestamp: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


class TelemetryLogResponse(TelemetryLog):
    pass
