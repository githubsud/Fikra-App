import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# --- TEMPORARY DEBUGGING LINE ---
print(f"--- DEBUG: Attempting to use API Key: '{os.getenv('GEMINI_API_KEY')}' ---")
# --------------------------------

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-flash')

CLASSIFICATION_PROMPT = """
You are an expert AI assistant for the Qatar Court of Justice. Your task is to classify an employee's idea into ONLY ONE of the following categories:
- Process Optimization
- Technology Adoption
- Employee Welfare
- Citizen & Lawyer Services
- Security & Infrastructure
- Legal Research & Support

Analyze the following idea and return only the category name, and nothing else.
Idea: "{idea_text}"
"""

ENHANCEMENT_PROMPT = """
You are an AI innovation consultant specializing in judicial and governmental systems. Your task is to take an employee's idea and enhance it into a structured proposal.
The response should be in {language_name}.
The enhanced proposal must include:
1.  **Title:** A concise, professional title for the idea.
2.  **Summary:** A brief one-paragraph summary.
3.  **Key Objectives:** A bulleted list of what this idea aims to achieve.
4.  **Proposed Implementation Steps:** A numbered list of actionable steps.
5.  **Potential Benefits:** A bulleted list of positive outcomes.
6.  **Potential Challenges to Consider:** A brief mention of possible hurdles.

Original Idea: "{idea_text}"
"""

def classify_idea(idea_text: str) -> str:
    prompt = CLASSIFICATION_PROMPT.format(idea_text=idea_text)
    response = model.generate_content(prompt)
    return response.text.strip()

def enhance_idea(idea_text: str, language: str) -> str:
    language_name = "Arabic" if language == 'ar' else "English"
    prompt = ENHANCEMENT_PROMPT.format(idea_text=idea_text, language_name=language_name)
    response = model.generate_content(prompt)
    return response.text.strip()