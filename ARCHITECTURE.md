# Fikra Application Architecture

This document provides a high-level overview of the technical architecture and technology stack for the Fikra application.

## High-Level Structure

The project is structured as a **monorepo** containing two primary, decoupled applications:
-   A **backend** API server built with Python and FastAPI.
-   A **frontend** single-page application (SPA) built with Angular.

This separation of concerns allows for independent development, testing, and deployment of the frontend and backend.

---

## Technology Stack

### Backend (`fikra-backend`)

-   **Framework:** **FastAPI** (Python) - A modern, high-performance web framework for building APIs.
-   **Database ORM:** **SQLAlchemy** - For mapping Python objects to database tables and executing SQL queries.
-   **Data Validation:** **Pydantic** - For defining data shapes (schemas) and performing automatic data validation and serialization.
-   **Database:** **SQLite** (for development) - A simple, file-based database. The application is designed to easily switch to **PostgreSQL** for production.
-   **Security:**
    -   **Passlib & Bcrypt:** For securely hashing and verifying user passwords.
    -   **python-jose:** For creating, signing, and validating JWT (JSON Web Tokens) for user authentication.
-   **AI Integration:** **Google Gemini API (`google-generativeai`)** - Used for all generative AI tasks, specifically leveraging the `gemini-1.5-flash` model for classification and content enhancement.

### Frontend (`fikra-stable`)

-   **Framework:** **Angular** (v18) - A powerful, component-based framework for building modern, scalable web applications.
-   **Architecture:** **Standalone Components** - The entire application is built using modern, standalone components, directives, and pipes for a modular and optimized structure.
-   **UI Component Library:** **Angular Material** - Provides a suite of high-quality, pre-built, and themeable UI components (cards, forms, buttons, etc.).
-   **Internationalization (i18n):** **@angular/localize** - The official Angular framework for providing a complete bilingual (Arabic and English) user experience, including Right-to-Left (RTL) layout support.
-   **Charting:** **ng2-charts** (a wrapper for **Chart.js**) - Used to create dynamic, data-driven charts for the statistics dashboard.
-   **Rich Text Display:** **ngx-markdown** - Used to safely render AI-generated markdown content as formatted HTML.