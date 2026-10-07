from pydantic import BaseModel, ConfigDict, Field


class ChapterCreate(BaseModel):
    title: str = Field(min_length=1)
    start_time_seconds: float = Field(ge=0)
    description: str | None = None
    keywords: list[str] = Field(default_factory=list)


class ChapterResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    meeting_id: int
    title: str
    start_time_seconds: float
    description: str | None
    keywords: list[str]
