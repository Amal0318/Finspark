import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.telemetry import TelemetryLog
from app.schemas.transaction import BankingTransaction


class CorrelatedAlertBase(BaseModel):
    telemetry_log_id: Optional[int] = Field(None, examples=[1])
    banking_transaction_id: Optional[int] = Field(None, examples=[2])
    correlation_reason: str = Field(..., max_length=255, examples=["Suspicious transaction from IP undergoing active brute force attempt"])
    risk_score: float = Field(0.0, ge=0.0, le=100.0, examples=[85.5])
    status: str = Field("OPEN", max_length=20, examples=["OPEN"]) # OPEN, INVESTIGATING, RESOLVED, FALSE_POSITIVE
    notes: Optional[str] = Field(None, examples=["SecOps team notified, account suspended"])


class CorrelatedAlertCreate(CorrelatedAlertBase):
    pass


class CorrelatedAlertUpdate(BaseModel):
    status: Optional[str] = Field(None, max_length=20, examples=["RESOLVED"])
    notes: Optional[str] = Field(None, examples=["Confirmed legitimate transaction after phone callback"])


class CorrelatedAlert(CorrelatedAlertBase):
    id: int
    timestamp: datetime.datetime
    
    # Nested representation for correlation views
    telemetry_log: Optional[TelemetryLog] = None
    banking_transaction: Optional[BankingTransaction] = None

    model_config = ConfigDict(from_attributes=True)


class CorrelatedAlertResponse(CorrelatedAlert):
    pass
