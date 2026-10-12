from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Chapter, Meeting


def list_chapters(db: Session, meeting_id: int) -> list[Chapter]:
    meeting = db.get(Meeting, meeting_id)

    if meeting is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meeting not found",
        )

    stmt = (
        select(Chapter)
        .where(Chapter.meeting_id == meeting_id)
        .order_by(Chapter.start_time_seconds.asc())
    )

    return list(db.scalars(stmt).all())