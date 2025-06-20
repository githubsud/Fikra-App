# fikra-backend/gemini_client.py
import google.generativeai as genai
import os

# Configure the API key securely
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-flash')


def get_language_name(code: str) -> str:
    """Converts a language code to its full name using the new logic."""
    # Print the exact code we received from the main server file
    print(f"--- BACKEND DEBUG: get_language_name received code: '{code}' ---")

    # Your suggested logic
    if code.lower().startswith('en'):
        return 'English'
    else:
        return 'Arabic'

def classify_idea(idea_text: str, language: str) -> str:
    """Classifies an idea into a single category in the specified language."""
    lang_name = get_language_name(language)
    prompt = f"""
    You are an AI assistant for the Qatar Court of Justice.
    The following idea is written in either English or Arabic.
    Your entire response MUST be in {lang_name} only.

    Classify the idea into ONE of the following categories:
    - Process Optimization
    - Technology Adoption
    - Employee Welfare
    - Citizen & Lawyer Services
    - Security & Infrastructure
    - Legal Research & Support

    Idea: "{idea_text}"
    
    Return only the category name in {lang_name}.
    """
    response = model.generate_content(prompt)
    return response.text.strip()

def enhance_idea(idea_text: str, language: str) -> str:
    """Enhances an idea into a structured proposal in the specified language."""
    lang_name = get_language_name(language)
    prompt = f"""
    As an AI innovation consultant for the Qatar Court of Justice, enhance the following idea.
    Your entire response MUST be in {lang_name} only, including all titles and headers.
    Structure the response with a Title, Summary, Objectives, Steps, Benefits, and Challenges.

    Original Idea: "{idea_text}"
    """
    response = model.generate_content(prompt)
    return response.text.strip()