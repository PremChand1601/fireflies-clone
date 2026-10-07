from pydantic import BaseModel, ConfigDict, Field


class TranscriptSegmentCreate(BaseModel):
    speaker: str = Field(min_length=1)
    timestamp_seconds: float = Field(ge=0)
    text: str = Field(min_length=1)
    sequence: int = Field(ge=0)


class TranscriptSegmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    meeting_id: int
    speaker: str
    timestamp_seconds: float
    text: str
    sequence: int
