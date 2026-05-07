from datetime import timedelta
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.models.base import get_db
from app.schemas.user import UserCreate, UserLogin, Token, UserResponse, PasswordResetRequest, PasswordResetConfirm
from app.services.user_service import UserService
from app.core.security import create_access_token
from app.core.config import get_settings
from app.api.deps import get_current_user

router = APIRouter()
settings = get_settings()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    service = UserService(db)
    user = service.create(user_data)
    return user


@router.post("/login", response_model=Token)
async def login(login_data: UserLogin, db: Session = Depends(get_db)):
    service = UserService(db)
    user = service.authenticate(login_data.email, login_data.password)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/refresh", response_model=Token)
async def refresh_token(current_user = Depends(get_current_user)):
    access_token = create_access_token(
        data={"sub": str(current_user.id)},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/forgot-password")
async def forgot_password(
    request: PasswordResetRequest,
    db: Session = Depends(get_db),
):
    service = UserService(db)
    token = service.generate_reset_token(request.email)
    if token:
        return {"message": "Password reset link sent", "token": token}
    return {"message": "If email exists, reset link will be sent"}


@router.post("/reset-password")
async def reset_password(
    request: PasswordResetConfirm,
    db: Session = Depends(get_db),
):
    service = UserService(db)
    service.reset_password(request.token, request.new_password)
    return {"message": "Password reset successfully"}
