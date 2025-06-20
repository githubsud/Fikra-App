# fikra_backend/models.py

from sqlalchemy import Boolean, Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from pydantic import BaseModel
import datetime

from database import Base

# =================================================================
# 1. NEW SQLAlchemy User Model (This defines the 'users' table)
# =================================================================
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    department = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)

    # This creates a relationship so you can access all ideas from a user object
    ideas = relationship("Idea", back_populates="owner")


# =================================================================
# 2. UPDATED SQLAlchemy Idea Model (Adds a link to the user)
# =================================================================
class Idea(Base):
    __tablename__ = "ideas"

    id = Column(Integer, primary_key=True, index=True)
    submission_date = Column(DateTime(timezone=True), server_default=func.now())
    original_text = Column(Text, nullable=False)
    language = Column(String, default='en')
    ai_classification = Column(String, nullable=True)
    ai_enhanced_text = Column(Text, nullable=True)
    
    # This is the foreign key linking to the 'users' table
    owner_id = Column(Integer, ForeignKey("users.id"))

    # This creates a relationship so you can access the owner from an idea object
    owner = relationship("User", back_populates="ideas")


# =================================================================
# 3. NEW Pydantic Schemas for Users (For API validation)
# =================================================================
class UserBase(BaseModel):
    username: str
    department: str

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    id: int
    is_active: bool
    
    class Config:
        from_attributes = True

# This is the schema for returning user info in an API response (without the password)
class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True

# =================================================================
# 4. UPDATED Pydantic Schemas for Ideas (Now includes user info)
# =================================================================
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
    owner: UserResponse # <-- The idea response now includes the user who owns it

    class Config:
        from_attributes = True


class StatItem(BaseModel):
    """Represents a single data point for a chart (e.g., a bar or a pie slice)."""
    name: str
    value: int

class StatsResponse(BaseModel):
    """The full JSON response for the statistics endpoint."""
    ideas_by_department: list[StatItem]
    ideas_by_classification: list[StatItem]