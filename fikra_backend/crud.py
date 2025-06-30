# fikra-backend/crud.py

from sqlalchemy.orm import Session, selectinload
from sqlalchemy import func
import json
import numpy as np

import models
import security

# (Your existing User, Idea, Vote, Comment, and Stats functions remain here...)
# ...
# =================================================================
# User CRUD Functions
# =================================================================

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: models.UserCreate):
    hashed_password = security.get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        department=user.department,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# =================================================================
# Idea CRUD Functions
# =================================================================

def get_ideas(db: Session, skip: int = 0, limit: int = 100):
    return (
        db.query(models.Idea)
        .options(
            selectinload(models.Idea.owner), 
            selectinload(models.Idea.comments).selectinload(models.Comment.owner),
            selectinload(models.Idea.votes)
        )
        .order_by(models.Idea.submission_date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

def create_idea(db: Session, idea: models.IdeaCreate, user_id: int, classification: str, enhanced_text: str, embedding: list[float]):
    db_idea = models.Idea(
        original_text=idea.original_text,
        language=idea.language,
        owner_id=user_id,
        ai_classification=classification,
        ai_enhanced_text=enhanced_text,
        embedding=json.dumps(embedding)
    )
    db.add(db_idea)
    db.commit()
    db.refresh(db_idea)
    return db_idea

# =================================================================
# Similarity Search Function (with Threshold)
# =================================================================

def find_similar_ideas(db: Session, query_embedding: list[float], top_k: int = 5):
    """Finds the most similar ideas based on embedding vectors."""
    all_ideas = db.query(models.Idea).filter(models.Idea.embedding.isnot(None)).all()
    
    if not all_ideas:
        return []

    query_vector = np.array(query_embedding)
    
    # Define a minimum similarity score to be considered a match
    similarity_threshold = 0.7  # This means 70% similar. You can adjust this value.
    
    similarities = []
    for idea in all_ideas:
        idea_vector = np.array(json.loads(idea.embedding))
        
        dot_product = np.dot(query_vector, idea_vector)
        norm_query = np.linalg.norm(query_vector)
        norm_idea = np.linalg.norm(idea_vector)
        
        if norm_query > 0 and norm_idea > 0:
            similarity = dot_product / (norm_query * norm_idea)
            
            # NEW: Only add the idea if it meets our threshold
            if similarity > similarity_threshold:
                similarities.append((idea, similarity))

    # Sort by similarity score in descending order
    similarities.sort(key=lambda x: x[1], reverse=True)

    # Return the top N most similar ideas
    return similarities[:top_k]


# =================================================================
# Vote & Comment CRUD Functions
# =================================================================
def add_or_remove_vote(db: Session, idea_id: int, user_id: int):
    existing_vote = (
        db.query(models.Vote)
        .filter(models.Vote.idea_id == idea_id, models.Vote.owner_id == user_id)
        .first()
    )

    if existing_vote:
        db.delete(existing_vote)
        db.commit()
        return {"message": "Vote removed"}
    else:
        new_vote = models.Vote(owner_id=user_id, idea_id=idea_id)
        db.add(new_vote)
        db.commit()
        db.refresh(new_vote)
        return new_vote

def create_idea_comment(db: Session, comment: models.CommentCreate, idea_id: int, user_id: int):
    db_comment = models.Comment(
        text=comment.text, owner_id=user_id, idea_id=idea_id
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment
# =================================================================
# Statistics CRUD Functions
# =================================================================
def get_idea_count_by_department(db: Session):
    return (
        db.query(models.User.department, func.count(models.Idea.id).label("idea_count"))
        .join(models.Idea, models.User.id == models.Idea.owner_id)
        .group_by(models.User.department)
        .all()
    )

def get_idea_count_by_classification(db: Session):
    return (
        db.query(models.Idea.ai_classification, func.count(models.Idea.id).label("idea_count"))
        .filter(models.Idea.ai_classification.isnot(None))
        .group_by(models.Idea.ai_classification)
        .all()
    )
