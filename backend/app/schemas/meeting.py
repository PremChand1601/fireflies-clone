from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.action_item import ActionItemCreate, ActionItemResponse
from app.schemas.chapter import ChapterCreate, ChapterResponse
from app.schemas.transcript import TranscriptSegmentCreate, TranscriptSegmentResponse


class MeetingCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    meeting_date: datetime
    duration_seconds: int = Field(gt=0)
    participants: list[str] = Field(default_factory=list)
    summary: str | None = None
    transcript_segments: list[TranscriptSegmentCreate] = Field(default_factory=list)
    action_items: list[ActionItemCreate] = Field(default_factory=list)
    chapters: list[ChapterCreate] = Field(default_factory=list)


class MeetingUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    meeting_date: datetime | None = None
    duration_seconds: int | None = Field(default=None, gt=0)
    participants: list[str] | None = None
    summary: str | None = None


class MeetingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    meeting_date: datetime
    duration_seconds: int
    participants: list[str]
    summary: str | None
    created_at: datetime
    updated_at: datetime


class MeetingDetailResponse(MeetingResponse):
    transcript_segments: list[TranscriptSegmentResponse]
    action_items: list[ActionItemResponse]
    chapters: list[ChapterResponse]


class MeetingListResponse(BaseModel):
    items: list[MeetingResponse]
    total: int
