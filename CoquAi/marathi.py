import pdfplumber
import pytesseract
from pdf2image import convert_from_path
import re
import torch
from TTS.api import TTS
import soundfile as sf
from PIL import Image

# Configure Tesseract (Set the path if needed)
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"  # Update this if required

def extract_text_ocr(pdf_path, lang="mar"):
    """Extracts text from a PDF using OCR (for Google Translated PDFs)."""
    text = ""
    try:
        images = convert_from_path(pdf_path)
        
        for img in images:
            extracted_text = pytesseract.image_to_string(img, lang=lang)
            text += extracted_text + "\n"

        # Clean up extracted text
        text = re.sub(r"\(cid:\d+\)", "", text)  # Remove cid encoding artifacts
        text = text.encode("utf-8", "ignore").decode("utf-8")  # Fix encoding

        return text.strip()

    except Exception as e:
        print(f"Error extracting text: {e}")
        return None

def text_to_speech_coqui(text, lang="mr", output_audio_path="output_audio.wav"):
    """Converts Marathi text to speech using Coqui TTS."""
    try:
        # Marathi model for Coqui-AI
        model_name = "tts_models/mr/cv/vits"
        tts = TTS(model_name).to("cuda" if torch.cuda.is_available() else "cpu")
        
        # Generate speech
        wav = tts.tts(text)
        
        # Save audio
        sf.write(output_audio_path, wav, samplerate=22050)
        print(f"Audio saved as {output_audio_path}")
    
    except Exception as e:
        print(f"Error in TTS: {e}")

# Example Usage
pdf_path = "sample.pdf"  # Replace with your Marathi PDF file
extracted_text = extract_text_ocr(pdf_path, lang="mar")  # 'mar' for Marathi, 'hin' for Hindi

if extracted_text:
    print("Extracted Text (Preview):\n", extracted_text[:500])  # Show first 500 chars
    text_to_speech_coqui(extracted_text, lang="mr")
else:
    print("No text extracted or file error.")
