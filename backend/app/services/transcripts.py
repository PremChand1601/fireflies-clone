from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Meeting, TranscriptSegment


def list_transcript(
    db: Session,
    meeting_id: int,
) -> list[TranscriptSegment]:
    meeting = db.get(Meeting, meeting_id)

    if meeting is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meeting not found",
        )

    stmt = (
        select(TranscriptSegment)
        .where(TranscriptSegment.meeting_id == meeting_id)
        .order_by(TranscriptSegment.sequence.asc())
    )

    return list(db.scalars(stmt).all())