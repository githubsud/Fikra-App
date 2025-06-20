# Fikra System Workflow

This document describes the internal sequence of events for major features within the Fikra application.

## 1. User Login Workflow

This flow describes what happens when a user logs in.

1.  **User Action:** The user visits the application (`/`) and is routed to the **Login Page** (`LoginComponent`). They enter their username and password and click "Login".
2.  **Frontend (`LoginComponent`):** The `login()` method is called. It passes the credentials to the `AuthService`.
3.  **Frontend (`AuthService`):** The service creates an `x-www-form-urlencoded` request and makes an HTTP `POST` call to the backend's `/token` endpoint.
4.  **Backend (`main.py`):** The `/token` endpoint receives the request.
    - It uses `crud.py` to fetch the user from the `users` table by username.
    - It uses `security.py`'s `verify_password()` function to securely compare the provided password against the hashed password stored in the database.
    - If successful, it uses `security.py`'s `create_access_token()` function to generate a secure JWT.
    - The backend returns a JSON response containing the `access_token`.
5.  **Frontend (`AuthService`):** The `AuthService` receives the successful response and saves the `access_token` into the browser's `localStorage`.
6.  **Frontend (`LoginComponent`):** The component's `subscribe` block is notified of the success and uses the Angular **Router** to navigate the user to the `/main` page.

## 2. New Idea Submission & Real-Time Refresh Workflow

This flow describes what happens when a user submits a new idea.

1.  **User Action:** On the `/main` page (`MainLayoutComponent`), the user types an idea into the **Idea Form** (`IdeaFormComponent`) and clicks "Submit & Enhance".
2.  **Frontend (`IdeaFormComponent`):**
    - The `submit()` method is called.
    - It determines the current language (e.g., 'ar' or 'en') from Angular's `LOCALE_ID`.
    - It bundles the idea text and language into a JSON payload.
    - It calls the `submitIdea()` method in the `ApiService`.
3.  **Frontend (`ApiService`):** The service makes an HTTP `POST` call to the backend's `/ideas/` endpoint. (In the future, this service will also add the user's auth token to the request headers).
4.  **Backend (`main.py`):** The `/ideas/` endpoint receives the request.
    - It identifies the user (currently hardcoded to User #1, but will later be from the auth token).
    - It calls the `gemini_client.py` functions, passing the idea text and language. The client adds instructions like "respond in Arabic" to the prompts sent to the **Gemini API**.
    - It receives the classification and enhanced text back from Gemini.
    - It calls `crud.py`'s `create_idea()` function to save the complete idea, including the AI results and the `owner_id`, to the database.
    - The backend returns the newly created idea object as JSON.
5.  **Frontend (`IdeaFormComponent`):** The `submitIdea()` subscription's `next` block executes.
    - It clears the text box.
    - It emits the `(ideaSubmitted)` event.
6.  **Frontend (`MainLayoutComponent`):** This parent component catches the `(ideaSubmitted)` event.
    - Its `onIdeaSubmitted()` method is called.
    - It uses its `@ViewChild` reference to the **Dashboard** (`DashboardComponent`) to call the dashboard's public `loadIdeas()` method.
7.  **Frontend (`DashboardComponent`):**
    - The `loadIdeas()` method is executed.
    - It calls the `getIdeas()` method in the `ApiService`.
    - The service makes an HTTP `GET` call to the backend's `/ideas/` endpoint.
    - The component receives the **full, updated list** of ideas.
    - Angular's change detection updates the view, and the new idea appears instantly at the top of the list without a page refresh.