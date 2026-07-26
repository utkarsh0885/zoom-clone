from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.connection import get_db
from app.crud import meeting as crud_meeting
from app.schemas.meeting import MeetingCreate, MeetingResponse, JoinMeetingRequest, ScheduleMeetingRequest
from app.schemas.response import StandardResponse
from app.models.user import User
from app.routers.auth import get_current_user_optional

router = APIRouter(prefix="/meetings", tags=["meetings"])

@router.post("/schedule", response_model=StandardResponse[MeetingResponse])
def schedule_meeting(
    req: ScheduleMeetingRequest, 
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    if not req.title.strip():
        raise HTTPException(status_code=400, detail="Title cannot be empty")
    created_by_id = current_user.id if current_user else None
    db_meeting = crud_meeting.schedule_meeting(db, req, created_by=created_by_id)
    return StandardResponse(
        success=True,
        message="Meeting scheduled successfully",
        data=db_meeting
    )

@router.get("/upcoming", response_model=StandardResponse[List[MeetingResponse]])
def get_upcoming_meetings(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    created_by_id = current_user.id if current_user else None
    meetings = crud_meeting.get_upcoming_meetings(db, created_by=created_by_id)
    return StandardResponse(
        success=True,
        message="Upcoming meetings retrieved successfully",
        data=meetings
    )

@router.get("/recent", response_model=StandardResponse[List[MeetingResponse]])
def get_recent_meetings(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    created_by_id = current_user.id if current_user else None
    meetings = crud_meeting.get_recent_meetings(db, created_by=created_by_id)
    return StandardResponse(
        success=True,
        message="Recent meetings retrieved successfully",
        data=meetings
    )

@router.post("/instant", response_model=StandardResponse[MeetingResponse])
def create_instant_meeting(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    created_by_id = current_user.id if current_user else None
    host_name = current_user.full_name if current_user else "Guest User"
    meeting = MeetingCreate(title="Instant Meeting", host_name=host_name, status="INSTANT")
    db_meeting = crud_meeting.create_meeting(db, meeting, created_by=created_by_id)
    return StandardResponse(
        success=True,
        message="Instant meeting created successfully",
        data=db_meeting
    )

@router.post("/join", response_model=StandardResponse[MeetingResponse])
def join_meeting(req: JoinMeetingRequest, db: Session = Depends(get_db)):
    db_meeting = crud_meeting.join_meeting(db, req)
    if not db_meeting:
        raise HTTPException(status_code=404, detail="Meeting not found or invalid ID")
    
    return StandardResponse(
        success=True,
        message="Successfully joined meeting",
        data=db_meeting
    )

@router.post("/", response_model=StandardResponse[MeetingResponse])
def create_meeting(
    meeting: MeetingCreate, 
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    created_by_id = current_user.id if current_user else None
    db_meeting = crud_meeting.create_meeting(db, meeting, created_by=created_by_id)
    return StandardResponse(
        success=True,
        message="Meeting created successfully",
        data=db_meeting
    )

@router.get("/", response_model=StandardResponse[List[MeetingResponse]])
def get_meetings(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    meetings = crud_meeting.get_meetings(db, skip=skip, limit=limit)
    return StandardResponse(
        success=True,
        message="Meetings retrieved successfully",
        data=meetings
    )

@router.post("/{meeting_id}/join", response_model=StandardResponse[MeetingResponse])
def join_meeting_by_id(meeting_id: str, payload: JoinMeetingRequest, db: Session = Depends(get_db)):
    db_meeting = crud_meeting.get_meeting_by_id(db, meeting_id=meeting_id)
    if not db_meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    db_meeting = crud_meeting.add_participant(db, meeting_id=meeting_id, participant_name=payload.name)
    return StandardResponse(
        success=True,
        message="Joined meeting successfully",
        data=db_meeting
    )

@router.post("/{meeting_id}/end", response_model=StandardResponse[MeetingResponse])
def end_meeting(meeting_id: str, db: Session = Depends(get_db)):
    db_meeting = crud_meeting.end_meeting(db, meeting_id=meeting_id)
    if not db_meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return StandardResponse(
        success=True,
        message="Meeting ended successfully",
        data=db_meeting
    )

@router.delete("/{meeting_id}", response_model=StandardResponse[bool])
def delete_meeting(meeting_id: str, db: Session = Depends(get_db)):
    success = crud_meeting.delete_meeting(db, meeting_id=meeting_id)
    if not success:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return StandardResponse(
        success=True,
        message="Meeting deleted successfully",
        data=True
    )

@router.get("/{meeting_id}", response_model=StandardResponse[MeetingResponse])
def get_meeting(meeting_id: str, db: Session = Depends(get_db)):
    db_meeting = crud_meeting.get_meeting_by_meeting_id(db, meeting_id=meeting_id)
    if db_meeting is None:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return StandardResponse(
        success=True,
        message="Meeting retrieved successfully",
        data=db_meeting
    )
