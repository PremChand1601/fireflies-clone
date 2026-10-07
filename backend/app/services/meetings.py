from datetime import datetime
from typing import Literal

from fastapi import HTTPException, status
from sqlalchemy import String, cast, func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.models import ActionItem, Chapter, Meeting, TranscriptSegment
from app.schemas.meeting import MeetingCreate, MeetingUpdate

SortOption = Literal["newest", "oldest", "title", "duration"]


def _meeting_or_404(db: Session, meeting_id: int) -> Meeting:
    meeting = db.get(Meeting, meeting_id)
    if meeting is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")
    return meeting


def _detail_query(db: Session, meeting_id: int) -> Meeting:
    stmt = (
        select(Meeting)
        .options(
            selectinload(Meeting.transcript_segments),
            selectinload(Meeting.action_items),
            selectinload(Meeting.chapters),
        )
        .where(Meeting.id == meeting_id)
    )
    meeting = db.scalars(stmt).unique().one_or_none()
    if meeting is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")
    return meeting


def list_meetings(
    db: Session,
    *,
    q: str | None = None,
    sort: SortOption = "newest",
    date_from: datetime | None = None,
    date_to: datetime | None = None,
    participant: str | None = None,
    skip: int = 0,
    limit: int = 50,
) -> tuple[list[Meeting], int]:
    filters = []

    if q:
        pattern = f"%{q}%"
        filters.append(
            or_(
                Meeting.title.ilike(pattern),
                Meeting.summary.ilike(pattern),
                cast(Meeting.participants, String).ilike(pattern),
            )
        )

    if participant:
        filters.append(cast(Meeting.participants, String).ilike(f"%{participant}%"))

    if date_from is not None:
        filters.append(Meeting.meeting_date >= date_from)

    if date_to is not None:
        filters.append(Meeting.meeting_date <= date_to)

    order_by = {
        "newest": Meeting.meeting_date.desc(),
        "oldest": Meeting.meeting_date.asc(),
        "title": Meeting.title.asc(),
        "duration": Meeting.duration_seconds.desc(),
    }[sort]

    count_stmt = select(func.count(Meeting.id))
    list_stmt = select(Meeting).order_by(order_by).offset(skip).limit(limit)

    if filters:
        count_stmt = count_stmt.where(*filters)
        list_stmt = list_stmt.where(*filters)

    total = db.scalar(count_stmt) or 0
    items = list(db.scalars(list_stmt).all())
    return items, total


def get_meeting(db: Session, meeting_id: int) -> Meeting:
    return _detail_query(db, meeting_id)


def create_meeting(db: Session, payload: MeetingCreate) -> Meeting:
    meeting = Meeting(
        title=payload.title,
        meeting_date=payload.meeting_date,
        duration_seconds=payload.duration_seconds,
        participants=payload.participants,
        summary=payload.summary,
        transcript_segments=[
            TranscriptSegment(
                speaker=segment.speaker,
                timestamp_seconds=segment.timestamp_seconds,
                text=segment.text,
                sequence=segment.sequence,
            )
            for segment in payload.transcript_segments
        ],
        action_items=[
            ActionItem(
                task=item.task,
                assignee=item.assignee,
                due_date=item.due_date,
                completed=item.completed,
            )
            for item in payload.action_items
        ],
        chapters=[
            Chapter(
                title=chapter.title,
                start_time_seconds=chapter.start_time_seconds,
                description=chapter.description,
                keywords=chapter.keywords,
            )
            for chapter in payload.chapters
        ],
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)
    return _detail_query(db, meeting.id)


def update_meeting(db: Session, meeting_id: int, payload: MeetingUpdate) -> Meeting:
    meeting = _meeting_or_404(db, meeting_id)
    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(meeting, field, value)
    db.commit()
    return _detail_query(db, meeting.id)


def delete_meeting(db: Session, meeting_id: int) -> int:
    meeting = _meeting_or_404(db, meeting_id)
    db.delete(meeting)
    db.commit()
    return meeting_id


def list_transcript(db: Session, meeting_id: int) -> list[TranscriptSegment]:
    _meeting_or_404(db, meeting_id)
    stmt = (
        select(TranscriptSegment)
        .where(TranscriptSegment.meeting_id == meeting_id)
        .order_by(TranscriptSegment.sequence.asc())
    )
    return list(db.scalars(stmt).all())


def list_action_items(db: Session, meeting_id: int) -> list[ActionItem]:
    _meeting_or_404(db, meeting_id)
    stmt = select(ActionItem).where(ActionItem.meeting_id == meeting_id).order_by(ActionItem.id.asc())
    return list(db.scalars(stmt).all())


def list_chapters(db: Session, meeting_id: int) -> list[Chapter]:
    _meeting_or_404(db, meeting_id)
    stmt = (
        select(Chapter)
        .where(Chapter.meeting_id == meeting_id)
        .order_by(Chapter.start_time_seconds.asc())
    )
    return list(db.scalars(stmt).all())
