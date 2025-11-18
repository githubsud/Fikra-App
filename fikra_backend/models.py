# fikra-backend/models.py

from sqlalchemy import Boolean, Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from pydantic import BaseModel, ConfigDict
import datetime
from typing import List, Optional # <-- Import Optional

from database import Base

# =================================================================
# User Model
# =================================================================
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    department = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    ideas = relationship("Idea", back_populates="owner")
    comments = relationship("Comment", back_populates="owner")
    votes = relationship("Vote", back_populates="owner")


# =================================================================
# Idea Model (with new tags column)
# =================================================================
class Idea(Base):
    __tablename__ = "ideas"
    id = Column(Integer, primary_key=True, index=True)
    submission_date = Column(DateTime(timezone=True), server_default=func.now())
    original_text = Column(Text, nullable=False)
    language = Column(String, default='en')
    ai_classification = Column(String, nullable=True)
    ai_enhanced_text = Column(Text, nullable=True)
    embedding = Column(Text, nullable=True)
    tags = Column(Text, nullable=True) # <-- NEW: To store keywords as a JSON string
    
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="ideas")
    comments = relationship("Comment", back_populates="idea", cascade="all, delete-orphan")
    votes = relationship("Vote", back_populates="idea", cascade="all, delete-orphan")


# =================================================================
# Vote & Comment Models
# =================================================================
class Vote(Base):
    __tablename__ = "votes"
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    idea_id = Column(Integer, ForeignKey("ideas.id"), nullable=False)
    owner = relationship("User", back_populates="votes")
    idea = relationship("Idea", back_populates="votes")

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
# Pydantic Schemas
# =================================================================

# --- User Schemas ---
class UserBase(BaseModel):
    username: str
    department: str
class UserCreate(UserBase):
    password: str
class UserResponse(UserBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# --- Token Schema ---
class TokenData(BaseModel):
    username: str | None = None

# --- Comment Schemas ---
class CommentBase(BaseModel):
    text: str
class CommentCreate(CommentBase):
    pass
class CommentResponse(CommentBase):
    id: int
    submission_date: datetime.datetime
    owner: UserResponse
    model_config = ConfigDict(from_attributes=True)

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
    comments: list[CommentResponse] = []
    vote_count: int = 0
    tags: Optional[str] = None # <-- NEW: Add tags to the response model
    model_config = ConfigDict(from_attributes=True)

# --- Statistics & Similarity Schemas ---
class StatItem(BaseModel):
    name: str
    value: int
class StatsResponse(BaseModel):
    ideas_by_department: list[StatItem]
    ideas_by_classification: list[StatItem]
    ideas_by_category: list[StatItem]
class FindSimilarRequest(BaseModel):
    text: str
class SimilarIdeaResponse(BaseModel):
    id: int
    original_text: str
    similarity: float
