import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class LoginLogBase(BaseModel):
    user_id: Optional[int] = Field(None, examples=[1])
    email_attempted: str = Field(..., max_length=255, examples=["admin@sentinelx.ai"])
    ip_address: str = Field(..., max_length=45, examples=["192.168.1.99"])
    user_agent: Optional[str] = Field(None, max_length=255, examples=["Mozilla/5.0..."])
    is_success: bool = Field(False, examples=[True])


class LoginLogCreate(LoginLogBase):
    pass


class LoginLog(LoginLogBase):
    id: int
    timestamp: datetime.datetime

    model_config = ConfigDict(from_attributes=True)
