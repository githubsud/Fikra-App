# fikra-backend/models.py

from sqlalchemy import Boolean, Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from pydantic import BaseModel
import datetime

from database import Base

# =================================================================
# 1. UPDATED User Model
# =================================================================
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    department = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)

    # Relationships to other tables
    ideas = relationship("Idea", back_populates="owner")
    comments = relationship("Comment", back_populates="owner") # <-- NEW
    votes = relationship("Vote", back_populates="owner")       # <-- NEW


# =================================================================
# 2. UPDATED Idea Model
# =================================================================
class Idea(Base):
    __tablename__ = "ideas"

    id = Column(Integer, primary_key=True, index=True)
    submission_date = Column(DateTime(timezone=True), server_default=func.now())
    original_text = Column(Text, nullable=False)
    language = Column(String, default='en')
    ai_classification = Column(String, nullable=True)
    ai_enhanced_text = Column(Text, nullable=True)
    
    owner_id = Column(Integer, ForeignKey("users.id"))

    # Relationships to other tables
    owner = relationship("User", back_populates="ideas")
    comments = relationship("Comment", back_populates="idea", cascade="all, delete-orphan") # <-- NEW
    votes = relationship("Vote", back_populates="idea", cascade="all, delete-orphan")       # <-- NEW


# =================================================================
# 3. NEW SQLAlchemy Vote Model
# =================================================================
class Vote(Base):
    __tablename__ = "votes"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    idea_id = Column(Integer, ForeignKey("ideas.id"), nullable=False)
    
    owner = relationship("User", back_populates="votes")
    idea = relationship("Idea", back_populates="votes")


# =================================================================
# 4. NEW SQLAlchemy Comment Model
# =================================================================
class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    submission_date = Column(DateTime(timezone=True), server_default=func.now())
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    idea_id = Column(Integer, ForeignKey("ideas.id"), nullable=False)

    owner = relationship("User", back_populates="comments")
    idea = relationship("Idea", back_populates="comments")


# =================================================================
# Pydantic Schemas (for API validation and responses)
# =================================================================

# --- User Schemas ---
class UserBase(BaseModel):
    username: str
    department: str

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    id: int
    is_active: bool
    class Config: from_attributes = True

class UserResponse(UserBase):
    id: int
    class Config: from_attributes = True

# --- Token Schema ---
class TokenData(BaseModel):
    username: str | None = None

# --- NEW Comment Schemas ---
class CommentBase(BaseModel):
    text: str

class CommentCreate(CommentBase):
    pass

class CommentResponse(CommentBase):
    id: int
    submission_date: datetime.datetime
    owner: UserResponse
    class Config: from_attributes = True

# --- Idea Schemas ---
class IdeaCreate(BaseModel):
    original_text: str
    language: str

class IdeaResponse(BaseModel):
    id: int
    submission_date: datetime.datetime
    original_text: str
    language: str
    ai_classification: str | None = None
    ai_enhanced_text: str | None = None
    owner: UserResponse
    comments: list[CommentResponse] = [] # <-- ADDED comments to the response
    vote_count: int = 0                  # <-- ADDED vote count to the response
    class Config: from_attributes = True

# --- Statistics Schemas ---
class StatItem(BaseModel):
    name: str
    value: int

class StatsResponse(BaseModel):
    ideas_by_department: list[StatItem]
    ideas_by_classification: list[StatItem]

