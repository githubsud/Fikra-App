# fikra-backend/init_db.py

from database import engine
import models

print("Attempting to create database tables...")
try:
    models.Base.metadata.create_all(bind=engine)
    print("Database tables created successfully (or already exist).")
except Exception as e:
    print(f"An error occurred during table creation: {e}")

