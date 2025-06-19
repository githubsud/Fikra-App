# fikra_backend/crud.py

from sqlalchemy.orm import Session
import models
import security

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

def get_ideas(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Idea).order_by(models.Idea.submission_date.desc()).offset(skip).limit(limit).all()

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