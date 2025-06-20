# fikra_backend/main.py

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Annotated
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta # <-- This was the missing import

import models, crud, gemini_client, security
from database import engine, get_db

# This will create the new 'users' table if it doesn't exist
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Fikra SJC Agent")

# CORS middleware to allow the Angular frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =================================================================
# NEW: User Registration Endpoint
# =================================================================
@app.post("/users/", response_model=models.UserResponse, tags=["Users"])
def register_user(user: models.UserCreate, db: Session = Depends(get_db)):
    """
    Registers a new user in the database.
    Checks if username already exists and hashes the password.
    """
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return crud.create_user(db=db, user=user)

# =================================================================
# NEW: User Login Endpoint (Token Generation)
# =================================================================
@app.post("/token", tags=["Users"])
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db)
):
    """
    Handles user login. Verifies username and password, then returns
    a JWT access token.
    """
    user = crud.get_user_by_username(db, username=form_data.username)
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# =================================================================
# UPDATED: Idea Endpoints
# =================================================================
@app.post("/ideas/", response_model=models.IdeaResponse, status_code=201, tags=["Ideas"])
def create_idea_endpoint(idea: models.IdeaCreate, db: Session = Depends(get_db)):
    """
    Creates a new idea. For now, it defaults to being owned by User ID 1.
    This will be updated later to use the currently logged-in user.
    """
    # --- TEMPORARY: Assign to User 1 until login is implemented ---
    # In a real app, you would get the user from an authentication token.
    owner_id = 1 
    db_user = db.query(models.User).filter(models.User.id == owner_id).first()
    if not db_user:
        raise HTTPException(
            status_code=404,
            detail=f"Owner user with ID {owner_id} not found. Please register a user first."
        )
    # --------------------------------------------------------------------

    # Call Gemini API to enhance and classify the idea
    classification = gemini_client.classify_idea(idea.original_text, language=idea.language) # <-- Add language here
    enhanced_text = gemini_client.enhance_idea(idea.original_text, language=idea.language)
    
    # Create the idea in the database, now linked to the owner
    db_idea = crud.create_idea(
        db=db,
        idea=idea,
        user_id=owner_id,
        classification=classification,
        enhanced_text=enhanced_text
    )
    return db_idea # Pydantic v2 can convert from ORM model directly


@app.get("/ideas/", response_model=List[models.IdeaResponse], tags=["Ideas"])
def read_ideas_endpoint(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieves a list of all ideas.
    This version MANUALLY builds the response to guarantee success.
    """
    ideas_from_db = crud.get_ideas(db, skip=skip, limit=limit)

    # Manually build the list of dictionaries for the response
    results = []
    for idea in ideas_from_db:
        # Check if the owner relationship is loaded
        if idea.owner:
            owner_data = {
                "id": idea.owner.id,
                "username": idea.owner.username,
                "department": idea.owner.department
            }
        else:
            # Provide a fallback just in case
            owner_data = {
                "id": 0,
                "username": "N/A",
                "department": "N/A"
            }
            
        # Manually create the dictionary for the idea itself
        idea_data = {
            "id": idea.id,
            "submission_date": idea.submission_date,
            "original_text": idea.original_text,
            "language": idea.language,
            "ai_classification": idea.ai_classification,
            "ai_enhanced_text": idea.ai_enhanced_text,
            "owner": owner_data  # Nest the owner data
        }
        results.append(idea_data)
    
    return results