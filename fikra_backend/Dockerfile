# 1. Use an official Python base image
# This starts us with a clean environment that has Python 3.11 installed.
FROM python:3.11-slim

# 2. Set the working directory inside the container
# All subsequent commands will run from this path.
WORKDIR /app

# 3. Copy local files into the container
# First, copy the file that lists our dependencies.
COPY requirements.txt .

# 4. Install the Python dependencies
# This runs 'pip install' inside the container.
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy the rest of your application code into the container
COPY . .

# 6. Expose the port
# This tells Cloud Run that our application will be listening for traffic on port 8000.
EXPOSE 8000

# 7. Define the command to run the application
# This is the command that Cloud Run will execute to start your FastAPI server.
# We use Gunicorn, a production-grade server, instead of Uvicorn for deployment.
CMD gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:$PORT