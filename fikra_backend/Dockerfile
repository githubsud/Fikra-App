# 1. Use an official Python base image
FROM python:3.11-slim

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy the requirements file first to leverage Docker layer caching
COPY requirements.txt .

# 4. Install the Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy the rest of your application code into the container
COPY . .

# 6. Make the startup script executable
RUN chmod +x /app/startup.sh

# 7. Expose the port that Cloud Run will provide
EXPOSE 8080

# 8. Define the command to run the application using the startup script
CMD ["/app/startup.sh"]
