#!/bin/bash

# --- Debugging Step: List all files recursively ---
echo "--- Listing all files in the container for debugging ---"
ls -R /app
echo "----------------------------------------------------"

# Run the database initialization script first
echo "--- Running Database Initialization ---"
python init_db.py
echo "--- Database Initialization Complete ---"

# Now, start the Gunicorn server
echo "--- Starting Gunicorn Server ---"
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:$PORT
