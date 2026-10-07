from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ActionItemCreate(BaseModel):
    task: str = Field(min_length=1)
    assignee: str | None = None
    due_date: datetime | None = None
    completed: bool = False


class ActionItemUpdate(BaseModel):
    task: str | None = Field(default=None, min_length=1)
    assignee: str | None = None
    due_date: datetime | None = None
    completed: bool | None = None


class ActionItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    meeting_id: int
    task: str
    assignee: str | None
    due_date: datetime | None
    completed: bool
    created_at: datetime
