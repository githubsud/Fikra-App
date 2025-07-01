# fikra-backend/gemini_client.py
import google.generativeai as genai
import os
import re

# Configure the API key securely
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Use a specific model for text generation tasks
generation_model = genai.GenerativeModel('gemini-1.5-flash')

def get_language_name(code: str) -> str:
    """Converts a language code (e.g., 'ar-QA') to its full name."""
    if code.lower().startswith('ar'):
        return 'Arabic'
    return 'English'

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
    response = generation_model.generate_content(prompt)
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
    response = generation_model.generate_content(prompt)
    return response.text.strip()

def generate_embedding(text: str):
    """Generates an embedding vector for a given piece of text."""
    result = genai.embed_content(
        model="models/text-embedding-004",
        content=text,
        task_type="RETRIEVAL_DOCUMENT"
    )
    return result['embedding']

# =================================================================
# NEW: Function to Extract Keywords
# =================================================================
def extract_keywords(text: str, language: str, count: int = 5) -> list[str]:
    """Extracts a specified number of keywords from a block of text."""
    lang_name = get_language_name(language)
    prompt = f"""
    Analyze the following text. Identify the {count} most important and relevant keywords or concepts.
    Your entire response MUST be in {lang_name} only.
    Return the keywords as a single, comma-separated list and nothing else.

    Example: Keyword One, Keyword Two, Keyword Three

    Text: "{text}"
    """
    try:
        response = generation_model.generate_content(prompt)
        # Clean up the response: split by comma, strip whitespace from each keyword
        keywords = [keyword.strip() for keyword in response.text.split(',')]
        return keywords
    except Exception as e:
        print(f"Error extracting keywords: {e}")
        return []

