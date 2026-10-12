from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import ActionItem, Meeting
from app.schemas.action_item import ActionItemCreate, ActionItemUpdate


def _meeting_or_404(db: Session, meeting_id: int) -> Meeting:
    meeting = db.get(Meeting, meeting_id)

    if meeting is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meeting not found",
        )

    return meeting


def create_action_item(
    db: Session,
    meeting_id: int,
    payload: ActionItemCreate,
) -> ActionItem:
    _meeting_or_404(db, meeting_id)

    item = ActionItem(
        meeting_id=meeting_id,
        task=payload.task,
        assignee=payload.assignee,
        due_date=payload.due_date,
        completed=payload.completed,
    )

    db.add(item)
    db.commit()
    db.refresh(item)

    return item


def list_action_items(
    db: Session,
    meeting_id: int,
) -> list[ActionItem]:
    _meeting_or_404(db, meeting_id)

    stmt = (
        select(ActionItem)
        .where(ActionItem.meeting_id == meeting_id)
        .order_by(ActionItem.id.asc())
    )

    return list(db.scalars(stmt).all())


def _action_item_or_404(
    db: Session,
    action_item_id: int,
) -> ActionItem:
    item = db.get(ActionItem, action_item_id)

    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Action item not found",
        )

    return item


def update_action_item(
    db: Session,
    action_item_id: int,
    payload: ActionItemUpdate,
) -> ActionItem:
    item = _action_item_or_404(db, action_item_id)

    updates = payload.model_dump(exclude_unset=True)

    for field, value in updates.items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)

    return item


def delete_action_item(
    db: Session,
    action_item_id: int,
) -> int:
    item = _action_item_or_404(db, action_item_id)

    db.delete(item)
    db.commit()

    return action_item_id