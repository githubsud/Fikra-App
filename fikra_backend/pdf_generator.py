# fikra-backend/pdf_generator.py

from fpdf import FPDF
from io import BytesIO
import models
import arabic_reshaper
from bidi.algorithm import get_display

class PDF(FPDF):
    def header(self):
        try:
            self.image('assets/SJC_Logo.png', x=self.w - self.l_margin - 50, y=8, w=50)
        except RuntimeError:
            print("Could not find SJC_Logo.png for PDF header. Skipping.")
        
        self.set_font('helvetica', 'B', 15)
        self.cell(0, 10, 'Fikra Idea Proposal', border=0, align='L')
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
        pdf.add_font('Amiri', '', 'helvetica')
    
    pdf.add_page()
    
    is_arabic = idea.language.lower().startswith('ar')

    if is_arabic:
        # --- Idea Title ---
        pdf.set_font('Amiri', '', 24)
        reshaped_title = arabic_reshaper.reshape(idea.original_text)
        bidi_title = get_display(reshaped_title)
        # Use split_only to pre-calculate line breaks
        title_lines = pdf.multi_cell(w=0, h=12, text=bidi_title, align='R', split_only=True)
        for line in title_lines:
            pdf.cell(0, 12, line, align='R', ln=1)
        pdf.ln(5)

        # --- Submitter Info ---
        pdf.set_font('Amiri', '', 10)
        submitted_by_text = f"Submitted by: {idea.owner.username} (Department: {idea.owner.department})"
        reshaped_submitter = arabic_reshaper.reshape(submitted_by_text)
        bidi_submitter = get_display(reshaped_submitter)
        pdf.multi_cell(0, 10, bidi_submitter, border=0, align='R')
        pdf.ln(15)

        # --- Enhanced Proposal Body ---
        pdf.set_font('Amiri', '', 12)
        reshaped_body = arabic_reshaper.reshape(idea.ai_enhanced_text)
        bidi_body = get_display(reshaped_body)
        # Use split_only to pre-calculate line breaks
        body_lines = pdf.multi_cell(w=0, h=10, text=bidi_body, align='R', split_only=True)
        for line in body_lines:
            pdf.cell(0, 10, line, align='R', ln=1)

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
