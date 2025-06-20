# Fikra (فكرة) - Idea Management & Enhancement Application

Fikra is a full-stack web application designed for the Supreme Judiciary Council (SJC) to capture, classify, and enhance innovative ideas from employees. It uses a modern tech stack including an Angular frontend, a FastAPI backend, and Google's Gemini API for AI-powered text processing.

## Features

-   **User Authentication:** Secure registration and login system.
-   **Idea Submission:** Users can submit new ideas to the platform.
-   **AI-Powered Analysis:** Each idea is automatically classified and enhanced into a structured proposal using the Gemini API.
-   **Bilingual Support (i18n):** Fully localized for both English (LTR) and Arabic (RTL).
-   **Statistics Dashboard:** Visual charts displaying metrics on submitted ideas.
-   **Persistent Storage:** All data is saved in a local SQLite database.

---

## Project Setup Guide

Follow these instructions to set up and run the project on a new machine after cloning it from GitHub.

### Prerequisites

-   **Git:** You must have Git installed. ([Download here](https://git-scm.com/))
-   **Node.js and npm:** Required for the Angular frontend. It is recommended to use an LTS version. ([Download here](https://nodejs.org/))
-   **Python:** Required for the FastAPI backend. (Version 3.10+ recommended, [Download here](https://www.python.org/))

---

### 1. Backend Setup (FastAPI)

First, set up and run the backend server.

1.  **Navigate to the Backend Folder:**
    ```bash
    cd path/to/Fikra/fikra_backend
    ```

2.  **Create and Activate a Python Virtual Environment:**
    ```bash
    python -m venv .venv
    .venv\Scripts\activate
    ```

3.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Set Environment Variables:**
    The application requires a Google Gemini API key. For security, this should be set as an environment variable.
    ```bash
    # On Windows Command Prompt
    set GEMINI_API_KEY=YOUR_API_KEY_HERE
    ```
    *(Replace `YOUR_API_KEY_HERE` with your actual key)*

5.  **Run the Backend Server:**
    ```bash
    uvicorn main:app --reload
    ```
    The backend API will now be running at `http://127.0.0.1:8000`.

---

### 2. Frontend Setup (Angular)

In a **new, separate terminal**, set up and run the Angular frontend.

1.  **Navigate to the Frontend Folder:**
    ```bash
    cd path/to/Fikra/fikra-stable
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Run the Frontend Server:**
    ```bash
    # To run the default Arabic version
    ng serve --configuration=ar

    # To run the English version
    ng serve
    ```
    The frontend application will now be running at `http://localhost:4200`.

---

### 3. First-Time Use

1.  With both servers running, go to the backend API docs at `http://127.0.0.1:8000/docs`.
2.  Use the `POST /users/` endpoint to register your first user.
3.  Now, you can go to the main application at `http://localhost:4200`, and log in with the credentials you just created.