# fikra-backend/pdf_generator.py

from fpdf import FPDF
from io import BytesIO
import models
import arabic_reshaper
from bidi.algorithm import get_display
from pathlib import Path

# Define the path to the assets directory relative to this file.
ASSETS_DIR = Path(__file__).parent / "assets"
LOGO_PATH = ASSETS_DIR / "SJC_Logo.png"
FONT_PATH = ASSETS_DIR / "Amiri-Regular.ttf"

class PDF(FPDF):
    def header(self):
        try:
            self.image(LOGO_PATH, x=self.w - self.l_margin - 50, y=8, w=50)
        except RuntimeError as e:
            print(f"Could not load logo: {e}")
        
        self.set_font('helvetica', 'B', 15)
        self.cell(0, 10, 'Fikra Idea Proposal', border=0, align='L')
        self.ln(30)

    def footer(self):
        self.set_y(-15)
        self.set_font('helvetica', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', border=0, align='C')

# NEW: Helper function to manually wrap text
def get_wrapped_text(pdf, text):
    lines = []
    # Split the original text into paragraphs
    for paragraph in text.split('\n'):
        words = paragraph.split()
        current_line = ""
        for word in words:
            # Check if adding the next word exceeds the page width
            if pdf.get_string_width(current_line + " " + word) < (pdf.w - pdf.l_margin - pdf.r_margin):
                current_line += " " + word
            else:
                lines.append(current_line.strip())
                current_line = word
        lines.append(current_line.strip())
    return lines

def create_proposal_pdf(idea: models.Idea):
    pdf = PDF()
    
    try:
        pdf.add_font('Amiri', '', FONT_PATH)
    except RuntimeError as e:
        print(f"Could not load font: {e}")
        pdf.add_font('Amiri', '', 'helvetica')
    
    pdf.add_page()
    
    is_arabic = idea.language.lower().startswith('ar')

    if is_arabic:
        # --- Idea Title ---
        pdf.set_font('Amiri', '', 24)
        # Manually wrap, then process and draw each line
        title_lines = get_wrapped_text(pdf, idea.original_text)
        for line in title_lines:
            reshaped_line = arabic_reshaper.reshape(line)
            bidi_line = get_display(reshaped_line)
            pdf.cell(0, 12, bidi_line, align='R', ln=1)
        pdf.ln(5)

        # --- Submitter Info ---
        pdf.set_font('Amiri', '', 10)
        submitted_by_text = f"Submitted by: {idea.owner.username} (Department: {idea.owner.department})"
        reshaped_submitter = arabic_reshaper.reshape(submitted_by_text)
        bidi_submitter = get_display(reshaped_submitter)
        pdf.cell(0, 10, bidi_submitter, align='R', ln=1)
        pdf.ln(15)

        # --- Enhanced Proposal Body ---
        pdf.set_font('Amiri', '', 12)
        # Manually wrap, then process and draw each line
        body_lines = get_wrapped_text(pdf, idea.ai_enhanced_text)
        for line in body_lines:
            reshaped_line = arabic_reshaper.reshape(line)
            bidi_line = get_display(reshaped_line)
            pdf.cell(0, 10, bidi_line, align='R', ln=1)

    else: # For English, write as before
        pdf.set_font('helvetica', '', 24)
        pdf.multi_cell(0, 12, idea.original_text, border=0, align='L')
        pdf.ln(5)

        pdf.set_font('helvetica', 'I', 10)
        submitted_by_text = f"Submitted by: {idea.owner.username} (Department: {idea.owner.department})"
        pdf.cell(0, 10, submitted_by_text, border=0, align='L')
        pdf.ln(15)

        pdf.set_font('helvetica', '', 12)
        pdf.multi_cell(0, 10, idea.ai_enhanced_text, border=0, align='L')

    return bytes(pdf.output())
