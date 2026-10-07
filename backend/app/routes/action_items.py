from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.action_item import ActionItemResponse, ActionItemUpdate
from app.services import action_items as action_item_service

router = APIRouter(prefix="/api/action-items", tags=["action-items"])


@router.put("/{action_item_id}", response_model=ActionItemResponse)
def update_action_item(
    action_item_id: int,
    payload: ActionItemUpdate,
    db: Session = Depends(get_db),
) -> ActionItemResponse:
    return action_item_service.update_action_item(db, action_item_id, payload)


@router.delete("/{action_item_id}")
def delete_action_item(action_item_id: int, db: Session = Depends(get_db)) -> dict[str, int | str]:
    deleted_id = action_item_service.delete_action_item(db, action_item_id)
    return {"status": "ok", "deleted_id": deleted_id}
