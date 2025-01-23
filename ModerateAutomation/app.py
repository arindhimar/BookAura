import fitz  # PyMuPDF
from PIL import Image
import pdfplumber
import pytesseract  # For OCR
from langdetect import detect
import io
import re

class EnhancedPDFAnalyzer:
    def __init__(self, pdf_path, page_limit, font_size_threshold):
        self.pdf_path = pdf_path
        self.page_limit = page_limit
        self.font_size_threshold = font_size_threshold

    def get_page_count(self):
        with fitz.open(self.pdf_path) as pdf:
            return len(pdf)

    def extract_text_with_structure(self):
        structured_text = []
        with pdfplumber.open(self.pdf_path) as pdf:
            for page_num, page in enumerate(pdf.pages, start=1):
                content = {"page": page_num, "text": page.extract_text()}
                structured_text.append(content)
        return structured_text

    def extract_images(self):
        images_info = []
        with fitz.open(self.pdf_path) as pdf:
            for page_num, page in enumerate(pdf, start=1):
                images = page.get_images(full=True)
                for img_index, img in enumerate(images):
                    xref = img[0]
                    base_image = pdf.extract_image(xref)
                    image_bytes = base_image["image"]
                    img_obj = Image.open(io.BytesIO(image_bytes))
                    images_info.append({
                        "page": page_num,
                        "image_index": img_index,
                        "width": img_obj.width,
                        "height": img_obj.height,
                        "size": len(image_bytes),
                        "alt_text": self.generate_image_alt_text(img_obj)
                    })
        return images_info

    def generate_image_alt_text(self, img_obj):
        # Use OCR for text in images
        ocr_text = pytesseract.image_to_string(img_obj)
        if ocr_text.strip():
            return ocr_text.strip()

        # Add generic description for non-text images (could be replaced with AI-generated captions)
        return "Image with no text content."

    def optimize_for_tts(self, structured_text, image_info):
        tts_ready_output = []
        for content in structured_text:
            page_text = content["text"]
            page_number = content["page"]

            # Remove headers, footers, and boilerplate
            page_text = self.clean_text(page_text)

            # Detect language for multilingual support
            detected_lang = detect(page_text) if page_text.strip() else "unknown"

            # Convert text to SSML format
            ssml_text = self.convert_to_ssml(page_text, image_info, page_number)

            tts_ready_output.append({
                "page": page_number,
                "language": detected_lang,
                "ssml_text": ssml_text
            })
        return tts_ready_output

    def clean_text(self, text):
        # Remove page numbers, headers, footers (customize as needed)
        text = re.sub(r"Page \d+", "", text, flags=re.IGNORECASE)
        text = re.sub(r"\n\s*\n", "\n", text)  # Remove excessive newlines
        return text.strip()

    def convert_to_ssml(self, text, image_info, page_number):
        ssml = "<speak>"
        paragraphs = text.split("\n")
        for paragraph in paragraphs:
            if paragraph.strip():
                # Add emphasis for headings or larger fonts
                if len(paragraph.split()) <= 5:  # Simple heuristic for headings
                    ssml += f"<p><emphasis level='strong'>{paragraph.strip()}</emphasis></p>"
                else:
                    ssml += f"<p>{paragraph.strip()}</p>"

        # Add alt-text for images on this page
        for img in image_info:
            if img["page"] == page_number:
                ssml += f"<p>Image description: {img['alt_text']}</p>"

        ssml += "</speak>"
        return ssml

    def analyze_pdf(self):
        results = {}

        # Check page count
        page_count = self.get_page_count()
        results["page_count"] = page_count
        results["page_limit_exceeded"] = page_count > self.page_limit

        # Extract structured text
        structured_text = self.extract_text_with_structure()

        # Analyze images
        images = self.extract_images()
        results["image_analysis"] = images

        # Optimize for TTS
        tts_ready_output = self.optimize_for_tts(structured_text, images)
        results["tts_ready_output"] = tts_ready_output

        return results


# Example Usage
if __name__ == "__main__":
    analyzer = EnhancedPDFAnalyzer(
        pdf_path="example.pdf",
        page_limit=50,
        font_size_threshold=12
    )
    report = analyzer.analyze_pdf()
    for page in report["tts_ready_output"]:
        print(f"Page {page['page']} (Language: {page['language']}):\n{page['ssml_text']}\n")
