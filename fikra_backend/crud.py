# fikra-backend/crud.py

from sqlalchemy.orm import Session, selectinload
from sqlalchemy import func
import models
import security

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
    """
    Gets ideas and eagerly loads related data (owner, comments, votes)
    to prevent performance issues.
    """
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

def create_idea(db: Session, idea: models.IdeaCreate, user_id: int, classification: str, enhanced_text: str):
    db_idea = models.Idea(
        original_text=idea.original_text,
        language=idea.language,
        owner_id=user_id,
        ai_classification=classification,
        ai_enhanced_text=enhanced_text
    )
    db.add(db_idea)
    db.commit()
    db.refresh(db_idea)
    return db_idea

# =================================================================
# NEW: Vote & Comment CRUD Functions
# =================================================================

def add_or_remove_vote(db: Session, idea_id: int, user_id: int):
    """
    Adds a vote if the user hasn't voted for the idea yet.
    Removes the vote if the user has already voted.
    """
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
    """Creates a new comment for an idea."""
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
