# fikra_backend/database.py

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# This URL points to a file named 'fikra_app.db' in your backend directory
SQLALCHEMY_DATABASE_URL = "sqlite:///./fikra_app.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    # This argument is needed for SQLite to work with FastAPI
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get a DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()