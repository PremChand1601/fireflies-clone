from datetime import datetime
from typing import Literal

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.action_item import ActionItemCreate, ActionItemResponse
from app.schemas.chapter import ChapterResponse
from app.schemas.meeting import (
    MeetingCreate,
    MeetingDetailResponse,
    MeetingListResponse,
    MeetingResponse,
    MeetingUpdate,
)
from app.schemas.transcript import TranscriptSegmentResponse
from app.services import action_items as action_item_service
from app.services import meetings as meeting_service

router = APIRouter(prefix="/api/meetings", tags=["meetings"])

SortOption = Literal["newest", "oldest", "title", "duration"]


@router.get("", response_model=MeetingListResponse)
def list_meetings(
    q: str | None = Query(default=None),
    sort: SortOption = Query(default="newest"),
    date_from: datetime | None = Query(default=None),
    date_to: datetime | None = Query(default=None),
    participant: str | None = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
    db: Session = Depends(get_db),
) -> MeetingListResponse:
    items, total = meeting_service.list_meetings(
        db,
        q=q,
        sort=sort,
        date_from=date_from,
        date_to=date_to,
        participant=participant,
        skip=skip,
        limit=limit,
    )
    return MeetingListResponse(items=items, total=total)


@router.get("/{meeting_id}", response_model=MeetingDetailResponse)
def get_meeting(meeting_id: int, db: Session = Depends(get_db)) -> MeetingDetailResponse:
    return meeting_service.get_meeting(db, meeting_id)


@router.post("", response_model=MeetingDetailResponse, status_code=status.HTTP_201_CREATED)
def create_meeting(payload: MeetingCreate, db: Session = Depends(get_db)) -> MeetingDetailResponse:
    return meeting_service.create_meeting(db, payload)


@router.put("/{meeting_id}", response_model=MeetingDetailResponse)
def update_meeting(
    meeting_id: int,
    payload: MeetingUpdate,
    db: Session = Depends(get_db),
) -> MeetingDetailResponse:
    return meeting_service.update_meeting(db, meeting_id, payload)


@router.delete("/{meeting_id}")
def delete_meeting(meeting_id: int, db: Session = Depends(get_db)) -> dict[str, int | str]:
    deleted_id = meeting_service.delete_meeting(db, meeting_id)
    return {"status": "ok", "deleted_id": deleted_id}


@router.get("/{meeting_id}/transcript", response_model=list[TranscriptSegmentResponse])
def get_transcript(meeting_id: int, db: Session = Depends(get_db)) -> list[TranscriptSegmentResponse]:
    return meeting_service.list_transcript(db, meeting_id)


@router.get("/{meeting_id}/action-items", response_model=list[ActionItemResponse])
def get_action_items(meeting_id: int, db: Session = Depends(get_db)) -> list[ActionItemResponse]:
    return meeting_service.list_action_items(db, meeting_id)


@router.post(
    "/{meeting_id}/action-items",
    response_model=ActionItemResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_action_item(
    meeting_id: int,
    payload: ActionItemCreate,
    db: Session = Depends(get_db),
) -> ActionItemResponse:
    return action_item_service.create_action_item(db, meeting_id, payload)


@router.get("/{meeting_id}/chapters", response_model=list[ChapterResponse])
def get_chapters(meeting_id: int, db: Session = Depends(get_db)) -> list[ChapterResponse]:
    return meeting_service.list_chapters(db, meeting_id)
