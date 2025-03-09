import pdfplumber
import pyttsx3
import re

def extract_text_from_pdf(pdf_path):
    """Extracts text from a PDF file."""
    text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                text += page.extract_text() + "\n" if page.extract_text() else ""
        return text.strip()
    except Exception as e:
        print(f"Error: {e}")
        return None

def preprocess_text(text):
    """Enhances text with better spacing for natural speech pauses."""
    text = re.sub(r"([.,!?])", r"\1 ", text)  # Ensure space after punctuation
    text = re.sub(r"\n+", ". \n", text)  # Convert new lines to sentence breaks
    return text

def text_to_speech(text, output_audio_path="output_audio.mp3"):
    """Converts text to speech with better pauses."""
    try:
        engine = pyttsx3.init()
        engine.setProperty("rate", 150)  # Adjust speed (default ~200)
        engine.setProperty("volume", 0.9)  # Adjust volume (0.0 to 1.0)
        
        processed_text = preprocess_text(text)
        engine.save_to_file(processed_text, output_audio_path)
        engine.runAndWait()
        print(f"Audio saved as {output_audio_path}")
    except Exception as e:
        print(f"Error in TTS: {e}")

pdf_path = "sample.pdf"  
extracted_text = extract_text_from_pdf(pdf_path)
