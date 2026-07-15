from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict


# Shared properties
class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[str] = "viewer"
    is_active: Optional[bool] = True
    is_superuser: bool = False


# Properties to receive via API on creation
class UserCreate(UserBase):
    email: EmailStr
    password: str


# Properties to receive via API on update
class UserUpdate(UserBase):
    password: Optional[str] = None


# Properties to return to client (Database representation)
class User(UserBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


# Schema for token responses
class Token(BaseModel):
    access_token: str
    token_type: str


# Schema for payload in access tokens
class TokenPayload(BaseModel):
    sub: Optional[str] = None
