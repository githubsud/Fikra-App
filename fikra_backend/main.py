# fikra-backend/main.py

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Annotated
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta

import models, crud, gemini_client, security
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Fikra SJC Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =================================================================
# User Endpoints
# =================================================================
@app.post("/users/", response_model=models.UserResponse, tags=["Users"])
def register_user(user: models.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return crud.create_user(db=db, user=user)

@app.post("/token", tags=["Users"])
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db)
):
    user = crud.get_user_by_username(db, username=form_data.username)
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# =================================================================
# Statistics Endpoint
# =================================================================
@app.get("/stats/", response_model=models.StatsResponse, tags=["Statistics"])
def get_stats(db: Session = Depends(get_db)):
    dept_stats_raw = crud.get_idea_count_by_department(db)
    class_stats_raw = crud.get_idea_count_by_classification(db)

    dept_stats = [{"name": name, "value": value} for name, value in dept_stats_raw]
    class_stats = [{"name": name, "value": value} for name, value in class_stats_raw]
    
    return {
        "ideas_by_department": dept_stats,
        "ideas_by_classification": class_stats,
    }

# =================================================================
# Idea Endpoints
# =================================================================
@app.post("/ideas/", response_model=models.IdeaResponse, status_code=201, tags=["Ideas"])
def create_idea_endpoint(
    idea: models.IdeaCreate,
    current_user: models.User = Depends(security.get_current_active_user), # <-- 1. This protects the endpoint and gets the user
    db: Session = Depends(get_db)
):
    """
    Creates a new idea, owned by the currently authenticated user.
    """
    # Call Gemini API
    classification = gemini_client.classify_idea(idea.original_text, language=idea.language)
    enhanced_text = gemini_client.enhance_idea(idea.original_text, language=idea.language)
    
    # Create the idea in the database, using the current_user's id
    db_idea = crud.create_idea(
        db=db,
        idea=idea,
        user_id=current_user.id, # <-- 2. Use the ID from the logged-in user
        classification=classification,
        enhanced_text=enhanced_text
    )
    return db_idea

@app.get("/ideas/", response_model=List[models.IdeaResponse], tags=["Ideas"])
def read_ideas_endpoint(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    ideas_from_db = crud.get_ideas(db, skip=skip, limit=limit)
    
    # Manually build the response to ensure nested owner data is loaded correctly
    results = []
    for idea in ideas_from_db:
        if idea.owner:
            owner_data = {
                "id": idea.owner.id,
                "username": idea.owner.username,
                "department": idea.owner.department
            }
        else:
            owner_data = { "id": 0, "username": "N/A", "department": "N/A" }
            
        idea_data = {
            "id": idea.id,
            "submission_date": idea.submission_date,
            "original_text": idea.original_text,
            "language": idea.language,
            "ai_classification": idea.ai_classification,
            "ai_enhanced_text": idea.ai_enhanced_text,
            "owner": owner_data
        }
        results.append(idea_data)
    
    return results
