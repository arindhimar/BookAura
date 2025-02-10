import fitz  
import pytesseract
from PIL import Image
from langdetect import detect
import io
import re
from pprint import pprint

# Configuration Settings
MAX_PAGES = 50
MIN_FONT_SIZE = 13.0
MAX_FONT_SIZE = 16.0
FONT_SIZE_TOLERANCE = 0.2  
MIN_IMAGE_QUALITY_DPI = 150  
OCR_CONFIDENCE_THRESHOLD = 60 
TEXT_VALIDATION_REGEX = r"[^\w\s,.?!'\"-]"  

def extract_text_from_pdf(pdf_path):
    """Extracts text, validates font size, and flags problematic words."""
    doc = fitz.open(pdf_path)
    all_text = []
    font_size_issues = []  
    
    for page_num, page in enumerate(doc):
        if page_num >= MAX_PAGES:
            print("PDF exceeds the maximum page limit!")
            return None

        text_instances = page.get_text("dict")["blocks"]
        for block in text_instances:
            if "lines" in block:
                for line in block["lines"]:
                    for span in line["spans"]:
                        font_size = span["size"]
                        text = span["text"].strip()
                        if not (MIN_FONT_SIZE - FONT_SIZE_TOLERANCE <= font_size <= MAX_FONT_SIZE + FONT_SIZE_TOLERANCE):
                            font_size_issues.append((text, font_size, page_num + 1))
                        if text:
                            all_text.append(text)

    if font_size_issues:
        print("\n Words with incorrect font size:")
        pprint(font_size_issues)
    
    return " ".join(all_text)

def extract_images_from_pdf(pdf_path):
    """Extracts images and validates quality."""
    doc = fitz.open(pdf_path)
    
    for page_num, page in enumerate(doc):
        images = page.get_images(full=True)
        for img_index, img in enumerate(images):
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            image = Image.open(io.BytesIO(image_bytes))
            
            # Check DPI (quality)
            dpi = image.info.get("dpi", (72, 72))[0] 
            if dpi < MIN_IMAGE_QUALITY_DPI:
                print(f" Low-quality image detected on page {page_num + 1} ({dpi} DPI)")

def detect_text_language(text):
    """Detects the primary language of the extracted text."""
    try:
        language = detect(text)
        print(f"Detected language: {language}")
    except Exception:
        print("Could not detect language.")

def perform_ocr_on_images(pdf_path):
    """Performs OCR and flags low-confidence words."""
    doc = fitz.open(pdf_path)
    low_confidence_words = []  
    
    for page_num, page in enumerate(doc):
        images = page.get_images(full=True)
        for img_index, img in enumerate(images):
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            image = Image.open(io.BytesIO(image_bytes))
            
            # OCR processing
            ocr_result = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
            for i in range(len(ocr_result["text"])):
                confidence = int(ocr_result["conf"][i])
                word = ocr_result["text"][i].strip()
                if word and confidence < OCR_CONFIDENCE_THRESHOLD: 
                    low_confidence_words.append((word, confidence, page_num + 1))
    
    if low_confidence_words:
        print("\n OCR-detected words with low confidence:")
        pprint(low_confidence_words)

def validate_text_content(text):
    """Checks for unwanted symbols or anomalies using regex."""
    flagged_words = re.findall(TEXT_VALIDATION_REGEX, text)
    if flagged_words:
        print("\nSuspicious characters detected in text:")
        pprint(flagged_words)

def moderate_pdf(pdf_path):
    """Runs all moderation checks on a PDF file."""
    print(f" Moderating PDF: {pdf_path}\n")

    # Extract and validate text
    text = extract_text_from_pdf(pdf_path)
    if text:
        detect_text_language(text)
        validate_text_content(text)

    extract_images_from_pdf(pdf_path)

    perform_ocr_on_images(pdf_path)

    print("\nPDF moderation complete.")

# Example usage:
pdf_file = "sample.pdf"
moderate_pdf(pdf_file)
