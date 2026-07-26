import uuid
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from app.database.connection import Base

class MeetingStatus(str, enum.Enum):
    INSTANT = "INSTANT"
    SCHEDULED = "SCHEDULED"
    ENDED = "ENDED"

class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    meeting_id = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    host_name = Column(String, nullable=False)
    status = Column(SQLEnum(MeetingStatus), default=MeetingStatus.INSTANT, nullable=False)
    invite_link = Column(String, nullable=False)
    scheduled_for = Column(DateTime, nullable=True)
    duration = Column(Integer, nullable=True)
    start_time = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    end_time = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    created_by = Column(String, ForeignKey("users.id"), nullable=True)

    participants = relationship("Participant", back_populates="meeting", cascade="all, delete-orphan")


class Participant(Base):
    __tablename__ = "participants"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    meeting_id = Column(String, ForeignKey("meetings.id"), nullable=False)
    name = Column(String, nullable=False)
    joined_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    left_at = Column(DateTime, nullable=True)

    meeting = relationship("Meeting", back_populates="participants")
