import fitz  # PyMuPDF
from googletrans import Translator
import time

# Initialize translator
translator = Translator()

def translate_text(text):
    try:
        return translator.translate(text, src='en', dest='mr').text
    except:
        return text  # Fallback to original text

def translate_pdf(input_path, output_path):
    # Open the PDF
    doc = fitz.open(input_path)
    
    # Use built-in Devanagari font instead
    marathi_font = fitz.Font(fontfile="Lohit-Marathi.ttf")
    
    for page in doc:
        text_instances = page.get_text("dict")["blocks"]
        
        for block in text_instances:
            if block["type"] != 0:
                continue
                
            for line in block["lines"]:
                for span in line["spans"]:
                    original_text = span["text"]
                    bbox = fitz.Rect(span["bbox"])
                    
                    translated_text = translate_text(original_text)
                    
                    # Redact original text
                    page.add_redact_annot(bbox, fill=(1,1,1))
                    
                    # Add translated text with proper font handling
                    page.insert_text(
                        point=bbox.tl,  # Use top-left instead of bottom-left
                        text=translated_text,
                        fontname=marathi_font.name,
                        fontsize=span["size"],
                        color=span["color"],
                        encoding=fitz.TEXT_ENCODING_UNICODE
                    )
        
        page.apply_redactions()
        page.clean_contents()

    doc.save(output_path)
    doc.close()

# Usage
translate_pdf("input.pdf", "output.pdf")