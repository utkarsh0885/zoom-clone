from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.models.meeting import MeetingStatus

class MeetingBase(BaseModel):
    title: str
    description: Optional[str] = None
    host_name: str
    status: MeetingStatus = MeetingStatus.INSTANT
    scheduled_for: Optional[datetime] = None
    duration: Optional[int] = None

class MeetingCreate(MeetingBase):
    pass

class JoinMeetingRequest(BaseModel):
    name: str
    meeting_id: str

class ScheduleMeetingRequest(BaseModel):
    title: str
    description: Optional[str] = None
    host_name: str
    scheduled_for: datetime
    duration: int

class ParticipantResponse(BaseModel):
    id: str
    name: str
    joined_at: datetime
    left_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class MeetingResponse(MeetingBase):
    id: str
    meeting_id: str
    invite_link: str
    start_time: datetime
    end_time: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    created_by: Optional[str] = None
    participants: List[ParticipantResponse] = []

    class Config:
        from_attributes = True
