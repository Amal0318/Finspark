import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class BankingTransactionBase(BaseModel):
    sender_account: str = Field(..., max_length=50, examples=["ACC-987654"])
    receiver_account: str = Field(..., max_length=50, examples=["ACC-123456"])
    amount: float = Field(..., gt=0.0, examples=[1500.50])
    currency: str = Field("USD", max_length=3, examples=["USD"])
    transaction_type: str = Field(..., max_length=20, examples=["transfer"]) # transfer, withdrawal, deposit
    location: Optional[str] = Field(None, max_length=100, examples=["New York, USA"])
    ip_address: str = Field(..., max_length=45, examples=["192.168.1.50"])
    device_fingerprint: Optional[str] = Field(None, max_length=100, examples=["browser-chrome-hash"])
    status: str = Field("COMPLETED", max_length=20, examples=["COMPLETED"]) # PENDING, COMPLETED, FAILED


class BankingTransactionCreate(BankingTransactionBase):
    pass


class BankingTransaction(BankingTransactionBase):
    id: int
    timestamp: datetime.datetime
    is_flagged: bool

    model_config = ConfigDict(from_attributes=True)


class BankingTransactionResponse(BankingTransaction):
    pass
