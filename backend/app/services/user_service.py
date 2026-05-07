from typing import List, Optional
from uuid import UUID
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, PasswordChange, PasswordResetRequest
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.exceptions import AuthenticationError, NotFoundError, ValidationError
from app.core.config import get_settings

settings = get_settings()


class UserService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()
    
    def get_by_id(self, user_id: UUID) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()
    
    def create(self, user_data: UserCreate) -> User:
        if self.get_by_email(user_data.email):
            raise ValidationError("Email already registered")
        
        db_user = User(
            email=user_data.email,
            hashed_password=get_password_hash(user_data.password),
            nickname=user_data.nickname,
            phone=user_data.phone,
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user
    
    def authenticate(self, email: str, password: str) -> User:
        user = self.get_by_email(email)
        if not user:
            raise AuthenticationError("Invalid email or password")
        if not verify_password(password, user.hashed_password):
            raise AuthenticationError("Invalid email or password")
        if not user.is_active:
            raise AuthenticationError("User is inactive")
        return user
    
    def update(self, user_id: UUID, user_data: UserUpdate) -> User:
        user = self.get_by_id(user_id)
        if not user:
            raise NotFoundError("User not found")
        
        for field, value in user_data.model_dump(exclude_unset=True).items():
            setattr(user, field, value)
        
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def change_password(self, user_id: UUID, password_data: PasswordChange) -> User:
        user = self.get_by_id(user_id)
        if not user:
            raise NotFoundError("User not found")
        
        if not verify_password(password_data.old_password, user.hashed_password):
            raise AuthenticationError("Invalid old password")
        
        user.hashed_password = get_password_hash(password_data.new_password)
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def generate_reset_token(self, email: str) -> str:
        user = self.get_by_email(email)
        if not user:
            return ""
        
        token = create_access_token(
            data={"sub": str(user.id), "purpose": "password_reset"},
            expires_delta=timedelta(minutes=30),
        )
        return token
    
    def reset_password(self, token: str, new_password: str) -> User:
        from app.core.security import decode_access_token
        
        payload = decode_access_token(token)
        if not payload or payload.get("purpose") != "password_reset":
            raise ValidationError("Invalid or expired reset token")
        
        user_id = payload.get("sub")
        user = self.get_by_id(UUID(user_id))
        if not user:
            raise NotFoundError("User not found")
        
        user.hashed_password = get_password_hash(new_password)
        self.db.commit()
        self.db.refresh(user)
        return user
