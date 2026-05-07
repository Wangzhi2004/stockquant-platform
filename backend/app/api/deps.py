import uuid
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import JWTError
from app.models.base import get_db
from app.models.user import User
from app.core.security import decode_access_token
from app.core.exceptions import AuthenticationError

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    token = credentials.credentials
    payload = decode_access_token(token)

    if payload is None:
        raise AuthenticationError("Invalid token")

    user_id_str = payload.get("sub")
    if user_id_str is None:
        raise AuthenticationError("Invalid token")

    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError:
        raise AuthenticationError("Invalid token")

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise AuthenticationError("User not found")

    if not user.is_active:
        raise AuthenticationError("User is inactive")

    return user


def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    return current_user
