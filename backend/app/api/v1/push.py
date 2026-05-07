from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID

from app.models.base import get_db
from app.models.user import User
from app.schemas.push import (
    PushConfigCreate, PushConfigUpdate, PushConfigResponse,
    PushLogResponse, PushSendRequest, PushBatchSendRequest, PushTestRequest,
)
from app.services.push_service import PushService
from app.api.deps import get_current_user

router = APIRouter()


@router.get("/configs", response_model=List[PushConfigResponse])
async def list_configs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = PushService(db)
    return service.get_configs(current_user.id)


@router.post("/configs", response_model=PushConfigResponse, status_code=201)
async def create_config(
    data: PushConfigCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = PushService(db)
    return service.create_config(current_user.id, data)


@router.put("/configs/{config_id}", response_model=PushConfigResponse)
async def update_config(
    config_id: UUID,
    data: PushConfigUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = PushService(db)
    return service.update_config(config_id, current_user.id, data)


@router.delete("/configs/{config_id}")
async def delete_config(
    config_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = PushService(db)
    service.delete_config(config_id, current_user.id)
    return {"message": "Config deleted"}


@router.get("/logs", response_model=List[PushLogResponse])
async def list_logs(
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = PushService(db)
    return service.get_logs(current_user.id, limit)


@router.post("/send")
async def send_push(
    request: PushSendRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = PushService(db)
    result = await service.send(current_user.id, request)
    return result


@router.post("/send-batch")
async def send_push_batch(
    request: PushBatchSendRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = PushService(db)
    results = []
    for channel in request.channels:
        req = PushSendRequest(
            channel=channel,
            title=request.title,
            content=request.content,
            type=request.type,
            extra=request.extra,
        )
        result = await service.send(current_user.id, req)
        results.append({"channel": channel, "result": result})
    return {"results": results}


@router.post("/send-all")
async def send_push_all(
    request: PushSendRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = PushService(db)
    results = await service.send_to_all(
        current_user.id, request.title, request.content, request.type
    )
    return {"results": results}


@router.post("/test")
async def test_push(
    request: PushTestRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = PushService(db)
    req = PushSendRequest(
        channel=request.channel,
        title=request.title,
        content=request.content,
        type="notification",
    )
    result = await service.send(current_user.id, req)
    return result
