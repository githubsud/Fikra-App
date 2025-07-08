# fikra-backend/database.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os

# --- Configuration for Local Development (SQLite) ---
# This line tells SQLAlchemy to use a local file named fikra_app.db
SQLALCHEMY_DATABASE_URL = "sqlite:///./fikra_app.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    # This argument is needed for SQLite to work correctly with FastAPI
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- FOR REFERENCE: Cloud SQL Configuration ---
# When you want to connect to the cloud database again, you would comment out
# the SQLite URL above and uncomment a block like this:
#
# DB_USER = os.environ.get("DB_USER", "postgres")
# DB_PASS = os.environ.get("DB_PASS")
# DB_NAME = os.environ.get("DB_NAME", "postgres")
# INSTANCE_CONNECTION_NAME = os.environ.get("INSTANCE_CONNECTION_NAME")
# SQLALCHEMY_DATABASE_URL = (
#     f"postgresql+pg8000://{DB_USER}:{DB_PASS}@/{DB_NAME}"
#     f"?unix_sock=/cloudsql/{INSTANCE_CONNECTION_NAME}/.s.PGSQL.5432"
# )
