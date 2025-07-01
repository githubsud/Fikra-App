# fikra-backend/pdf_generator.py

from fpdf import FPDF
from io import BytesIO
import models
import arabic_reshaper
from bidi.algorithm import get_display

class PDF(FPDF):
    def header(self):
        try:
            self.image('assets/SJC_Logo.png', x=150, y=8, w=50) # Positioned on the right for RTL
        except RuntimeError:
            print("Could not find SJC_Logo.png for PDF header. Skipping.")
        
        self.set_font('helvetica', 'B', 15)
        self.cell(0, 10, 'Fikra Idea Proposal', border=0, align='L') # English title on the left
        self.ln(30)

    def footer(self):
        self.set_y(-15)
        self.set_font('helvetica', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', border=0, align='C')

def create_proposal_pdf(idea: models.Idea):
    pdf = PDF()
    
    try:
        pdf.add_font('Amiri', '', 'assets/Amiri-Regular.ttf')
    except RuntimeError:
        print("Could not find Amiri-Regular.ttf. Arabic text may not render correctly.")
        pdf.add_font('Amiri', '', 'helvetica') # Fallback font
    
    pdf.add_page()
    
    # --- Process and write text based on language ---
    is_arabic = idea.language.lower().startswith('ar')

    if is_arabic:
        # For Arabic, reshape and apply bidi algorithm
        pdf.set_font('Amiri', '', 24)
        reshaped_title = arabic_reshaper.reshape(idea.original_text)
        bidi_title = get_display(reshaped_title)
        pdf.multi_cell(0, 10, bidi_title, border=0, align='R') # Align Right
        pdf.ln(5)

        # Submitter info is in English, so align left
        pdf.set_font('helvetica', 'I', 10)
        submitted_by_text = f"Submitted by: {idea.owner.username} (Department: {idea.owner.department})"
        pdf.cell(0, 10, submitted_by_text, border=0, align='L')
        pdf.ln(15)

        # Process the enhanced proposal text
        pdf.set_font('Amiri', '', 12)
        reshaped_body = arabic_reshaper.reshape(idea.ai_enhanced_text)
        bidi_body = get_display(reshaped_body)
        pdf.multi_cell(0, 10, bidi_body, border=0, align='R') # Align Right

    else: # For English, write as before
        pdf.set_font('helvetica', '', 24)
        pdf.multi_cell(0, 10, idea.original_text, border=0, align='L')
        pdf.ln(5)

        pdf.set_font('helvetica', 'I', 10)
        submitted_by_text = f"Submitted by: {idea.owner.username} (Department: {idea.owner.department})"
        pdf.cell(0, 10, submitted_by_text, border=0, align='L')
        pdf.ln(15)

        pdf.set_font('helvetica', '', 12)
        pdf.multi_cell(0, 10, idea.ai_enhanced_text, border=0, align='L')

    # Return the raw PDF bytes
    return bytes(pdf.output())
