import pdfplumber
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from googletrans import Translator
import time
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Correct font registration
pdfmetrics.registerFont(TTFont('MarathiFont', 'Lohit-Marathi.ttf'))  # Ensure correct filename

def translate_text(text, translator, max_retries=3):
    for _ in range(max_retries):
        try:
            translated = translator.translate(text, src='en', dest='mr').text
            return translated
        except Exception as e:
            print(f"Error: {e}, Retrying...")
            time.sleep(2)
    return text  # Fallback to original text 

def pdf_to_marathi(input_pdf, output_pdf):
    translator = Translator()
    
    with pdfplumber.open(input_pdf) as pdf:
        c = canvas.Canvas(output_pdf, pagesize=letter)
        
        # Use registered font name
        c.setFont("MarathiFont", 12)  # Changed to match registered name
        
        y_position = 750
        line_height = 15
        
        for page in pdf.pages:
            text = page.extract_text()
            
            # Add text cleaning
            if not text:
                continue
                
            marathi_text = translate_text(text, translator)
            
            # Handle Devanagari rendering
            for line in marathi_text.split('\n'):
                try:
                    c.drawString(50, y_position, line)
                except UnicodeEncodeError:
                    c.drawString(50, y_position, line.encode('utf-8'))
                y_position -= line_height
                
                if y_position < 50:
                    c.showPage()
                    c.setFont("MarathiFont", 12)
                    y_position = 750
            
            c.showPage()
        
        c.save()

# Usage
pdf_to_marathi("input.pdf", "output.pdf")