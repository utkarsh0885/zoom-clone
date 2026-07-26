from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.connection import engine, Base
from app.models import meeting, user
from app.routers import meeting as meeting_router, auth as auth_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Zoom Clone API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(meeting_router.router)
app.include_router(auth_router.router)

@app.get("/")
def root():
    return {"message": "Zoom Clone API is running"}
