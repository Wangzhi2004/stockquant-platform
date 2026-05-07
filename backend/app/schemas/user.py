from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import datetime


class UserBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    email: EmailStr
    nickname: Optional[str] = None
    phone: Optional[str] = None


class UserCreate(UserBase):
    pass


class UserLogin(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    nickname: Optional[str] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    role: str
    is_active: bool
    created_at: datetime


class Token(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    access_token: str
    token_type: str = "bearer"


class PasswordChange(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    old_password: str
    new_password: str
