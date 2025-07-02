# fikra-backend/pdf_generator.py
from fpdf import FPDF
from io import BytesIO
import models
import arabic_reshaper
from bidi.algorithm import get_display
import textwrap

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

def add_arabic_text(pdf, text, font_size, line_height, max_width=None):
    """
    Add Arabic text to PDF with proper text direction and line breaks
    """
    pdf.set_font('Amiri', '', font_size)
    
    # Calculate available width if not specified
    if max_width is None:
        max_width = pdf.w - pdf.l_margin - pdf.r_margin
    
    # Split text into logical paragraphs first
    paragraphs = text.split('\n')
    
    for paragraph in paragraphs:
        if not paragraph.strip():
            pdf.ln(line_height)
            continue
            
        # For each paragraph, we need to handle word wrapping manually
        # to avoid the line reversal issue
        
        # First, reshape the entire paragraph
        reshaped_paragraph = arabic_reshaper.reshape(paragraph)
        
        # Split into words (be careful with Arabic word boundaries)
        words = reshaped_paragraph.split(' ')
        
        current_line = []
        for word in words:
            # Test if adding this word would exceed the width
            test_line = ' '.join(current_line + [word])
            test_bidi = get_display(test_line)
            
            # Get the width of the test line
            pdf.set_font('Amiri', '', font_size)
            text_width = pdf.get_string_width(test_bidi)
            
            if text_width <= max_width or not current_line:
                current_line.append(word)
            else:
                # Output the current line
                if current_line:
                    line_text = ' '.join(current_line)
                    bidi_line = get_display(line_text)
                    pdf.cell(0, line_height, bidi_line, align='R', ln=1)
                
                # Start new line with current word
                current_line = [word]
        
        # Output any remaining text
        if current_line:
            line_text = ' '.join(current_line)
            bidi_line = get_display(line_text)
            pdf.cell(0, line_height, bidi_line, align='R', ln=1)
        
        # Add paragraph spacing
        pdf.ln(2)

def create_proposal_pdf(idea: models.Idea):
    pdf = PDF()
    
    try:
        pdf.add_font('Amiri', '', 'assets/Amiri-Regular.ttf')
    except RuntimeError:
        print("Could not find Amiri-Regular.ttf. Arabic text may not render correctly.")
        # Fallback - you might want to use a different approach here
        pdf.add_font('Amiri', '', 'helvetica')
    
    pdf.add_page()
    
    is_arabic = idea.language.lower().startswith('ar')
    
    if is_arabic:
        # --- Idea Title ---
        add_arabic_text(pdf, idea.original_text, 24, 12)
        pdf.ln(5)
        
        # --- Submitter Info ---
        pdf.set_font('Amiri', '', 10)
        submitted_by_text = f"مقدم من: {idea.owner.username} (القسم: {idea.owner.department})"
        add_arabic_text(pdf, submitted_by_text, 10, 10)
        pdf.ln(15)
        
        # --- Enhanced Proposal Body ---
        add_arabic_text(pdf, idea.ai_enhanced_text, 12, 10)
            
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