from sqlalchemy.orm import Session
from app.models.meeting import Meeting, Participant, MeetingStatus
from app.schemas.meeting import MeetingCreate, JoinMeetingRequest, ScheduleMeetingRequest
import random
import string
from sqlalchemy import or_
from datetime import datetime, timezone
from typing import Optional
import os

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

def generate_meeting_id():
    return ''.join(random.choices(string.digits, k=9))

def create_meeting(db: Session, meeting: MeetingCreate, created_by: Optional[str] = None):
    meeting_id = generate_meeting_id()
    formatted_id = f"{meeting_id[:3]}-{meeting_id[3:6]}-{meeting_id[6:]}"
    invite_link = f"{FRONTEND_URL.rstrip('/')}/join/{formatted_id}"
    
    db_meeting = Meeting(
        **meeting.model_dump(),
        meeting_id=formatted_id,
        invite_link=invite_link,
        created_by=created_by
    )
    db.add(db_meeting)
    db.commit()
    db.refresh(db_meeting)
    return db_meeting

def get_meeting_by_meeting_id(db: Session, meeting_id: str):
    return db.query(Meeting).filter(Meeting.meeting_id == meeting_id).first()

def get_meeting_by_id(db: Session, meeting_id: str):
    return db.query(Meeting).filter(Meeting.id == meeting_id).first()

def get_meetings(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Meeting).order_by(Meeting.created_at.desc()).offset(skip).limit(limit).all()

def join_meeting(db: Session, req: JoinMeetingRequest):
    meeting = get_meeting_by_meeting_id(db, req.meeting_id)
    if not meeting:
        return None
    
    participant = Participant(
        meeting_id=meeting.id,
        name=req.name
    )
    db.add(participant)
    db.commit()
    db.refresh(participant)
    
    db.refresh(meeting)
    return meeting

def add_participant(db: Session, meeting_id: str, participant_name: str):
    meeting = get_meeting_by_id(db, meeting_id)
    if not meeting:
        return None
    participant = Participant(
        meeting_id=meeting.id,
        name=participant_name
    )
    db.add(participant)
    db.commit()
    db.refresh(participant)
    db.refresh(meeting)
    return meeting

def schedule_meeting(db: Session, req: ScheduleMeetingRequest, created_by: Optional[str] = None):
    meeting_id = generate_meeting_id()
    formatted_id = f"{meeting_id[:3]}-{meeting_id[3:6]}-{meeting_id[6:]}"
    invite_link = f"{FRONTEND_URL.rstrip('/')}/join/{formatted_id}"
    
    db_meeting = Meeting(
        title=req.title,
        description=req.description,
        host_name=req.host_name,
        status=MeetingStatus.SCHEDULED,
        invite_link=invite_link,
        meeting_id=formatted_id,
        scheduled_for=req.scheduled_for,
        duration=req.duration,
        start_time=req.scheduled_for,
        created_by=created_by
    )
    db.add(db_meeting)
    db.commit()
    db.refresh(db_meeting)
    return db_meeting

def get_upcoming_meetings(db: Session, created_by: Optional[str] = None):
    now = datetime.now(timezone.utc)
    return db.query(Meeting).filter(
        Meeting.status == MeetingStatus.SCHEDULED, 
        Meeting.scheduled_for >= now,
        Meeting.created_by == created_by
    ).order_by(Meeting.scheduled_for.asc()).all()

def get_recent_meetings(db: Session, created_by: Optional[str] = None):
    now = datetime.now(timezone.utc)
    return db.query(Meeting).filter(
        or_(
            Meeting.status == MeetingStatus.ENDED,
            Meeting.scheduled_for < now
        ),
        Meeting.created_by == created_by
    ).order_by(Meeting.created_at.desc()).limit(10).all()

def end_meeting(db: Session, meeting_id: str):
    db_meeting = db.query(Meeting).filter(Meeting.meeting_id == meeting_id).first()
    if db_meeting:
        db_meeting.status = MeetingStatus.ENDED
        db_meeting.end_time = datetime.now(timezone.utc)
        db.commit()
        db.refresh(db_meeting)
        return db_meeting
    return None

def delete_meeting(db: Session, meeting_id: str):
    db_meeting = db.query(Meeting).filter(Meeting.meeting_id == meeting_id).first()
    if db_meeting:
        db.delete(db_meeting)
        db.commit()
        return True
    return False
