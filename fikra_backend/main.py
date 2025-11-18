# fikra-backend/main.py

from fastapi import FastAPI, Depends, HTTPException, status, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Annotated
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import timedelta
from contextlib import asynccontextmanager

import models, crud, gemini_client, security
from database import engine, get_db
import pdf_generator

def create_db_and_tables():
    print("--- Lifespan event: Creating database tables... ---")
    try:
        models.Base.metadata.create_all(bind=engine)
        print("--- Lifespan event: Database tables created successfully. ---")
    except Exception as e:
        print(f"--- Lifespan event: An error occurred during table creation: {e} ---")

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

# THIS IS THE CORRECTED LINE FOR LOCAL DEVELOPMENT
app = FastAPI(title="Fikra SJC Agent", lifespan=lifespan, root_path="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =================================================================
# Root Endpoint for Health Check
# =================================================================
@app.get("/", tags=["Root"])
def read_root():
    return {"status": "Fikra Backend is running"}

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

@app.get("/users/me/", response_model=models.UserResponse, tags=["Users"])
async def read_users_me(current_user: models.User = Depends(security.get_current_active_user)):
    return current_user

# =================================================================
# All other endpoints (Stats, Ideas, etc.) remain the same
# =================================================================
@app.get("/stats/", response_model=models.StatsResponse, tags=["Statistics"])
def get_stats(db: Session = Depends(get_db)):
    dept_stats_raw = crud.get_idea_count_by_department(db)
    class_stats_raw = crud.get_idea_count_by_classification(db)
    category_stats_raw = crud.get_idea_count_by_category(db)
    dept_stats = [{"name": name, "value": value} for name, value in dept_stats_raw]
    class_stats = [{"name": name, "value": value} for name, value in class_stats_raw]
    category_stats = [{"name": name, "value": value} for name, value in category_stats_raw]
    return {
        "ideas_by_department": dept_stats,
        "ideas_by_classification": class_stats,
        "ideas_by_category": category_stats
    }

@app.post("/ideas/", response_model=models.IdeaResponse, status_code=201, tags=["Ideas"])
def create_idea_endpoint(
    idea: models.IdeaCreate,
    current_user: models.User = Depends(security.get_current_active_user),
    db: Session = Depends(get_db)
):
    classification = gemini_client.classify_idea(idea.original_text, language=idea.language)
    enhanced_text = gemini_client.enhance_idea(idea.original_text, language=idea.language)
    embedding = gemini_client.generate_embedding(idea.original_text)
    tags = gemini_client.extract_keywords(enhanced_text, language=idea.language)
    db_idea = crud.create_idea(
        db=db, idea=idea, user_id=current_user.id, classification=classification, enhanced_text=enhanced_text, embedding=embedding, tags=tags
    )
    idea_response = models.IdeaResponse.model_validate(db_idea)
    idea_response.vote_count = len(db_idea.votes)
    return idea_response

@app.post("/ideas/find-similar", response_model=List[models.SimilarIdeaResponse], tags=["Ideas"])
def find_similar_ideas_endpoint(
    request: models.FindSimilarRequest,
    db: Session = Depends(get_db)
):
    if not request.text or not request.text.strip(): return []
    query_embedding = gemini_client.generate_embedding(request.text)
    similar_ideas = crud.find_similar_ideas(db, query_embedding)
    response = [{"id": idea.id, "original_text": idea.original_text, "similarity": score} for idea, score in similar_ideas]
    return response

@app.get("/ideas/", response_model=List[models.IdeaResponse], tags=["Ideas"])
def read_ideas_endpoint(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    ideas_from_db = crud.get_ideas(db, skip=skip, limit=limit)
    results = []
    for idea in ideas_from_db:
        idea_response = models.IdeaResponse.model_validate(idea)
        idea_response.vote_count = len(idea.votes)
        results.append(idea_response)
    return results

@app.get("/ideas/{idea_id}/export-pdf", tags=["Ideas"])
def export_idea_pdf(idea_id: int, db: Session = Depends(get_db)):
    idea = db.query(models.Idea).filter(models.Idea.id == idea_id).first()
    if not idea: raise HTTPException(status_code=404, detail="Idea not found")
    pdf_bytes = pdf_generator.create_proposal_pdf(idea)
    headers = {'Content-Disposition': f'attachment; filename="idea_proposal_{idea_id}.pdf"'}
    return Response(content=pdf_bytes, media_type='application/pdf', headers=headers)

@app.post("/ideas/{idea_id}/vote", status_code=200, tags=["Ideas"])
def vote_for_idea(
    idea_id: int, current_user: models.User = Depends(security.get_current_active_user), db: Session = Depends(get_db)
):
    return crud.add_or_remove_vote(db=db, idea_id=idea_id, user_id=current_user.id)

@app.post("/ideas/{idea_id}/comments", response_model=models.CommentResponse, status_code=201, tags=["Ideas"])
def create_comment_for_idea(
    idea_id: int, comment: models.CommentCreate, current_user: models.User = Depends(security.get_current_active_user), db: Session = Depends(get_db)
):
    return crud.create_idea_comment(db=db, comment=comment, idea_id=idea_id, user_id=current_user.id)
