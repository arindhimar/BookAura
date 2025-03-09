import fitz
from deep_translator import GoogleTranslator
import subprocess
import os

# 1. PDF Text Extraction ======================================================
def extract_text_from_pdf(pdf_path):
    """Extract text from PDF with validation"""
    doc = fitz.open(pdf_path)
    text = "\n".join([page.get_text("text") for page in doc]).strip()
    if not text:
        raise ValueError("PDF contains no extractable text")
    return text

# 2. Translation ==============================================================
def translate_to_marathi(english_text):
    """Translate text to Marathi with chunking"""
    if not english_text.strip():
        raise ValueError("No text to translate")
    
    # Initialize translator
    translator = GoogleTranslator(source='en', target='mr')
    
    # Split into chunks (Google Translate limit: 5000 chars)
    chunks = [english_text[i:i+4500] for i in range(0, len(english_text), 4500)]
    
    # Translate and collect
    translated_chunks = []
    for i, chunk in enumerate(chunks, 1):
        print(f"Translating chunk {i}/{len(chunks)}...")
        translated = translator.translate(chunk)
        translated_chunks.append(translated)
    
    return " ".join(translated_chunks).strip()

# 3. Text-to-Speech ===========================================================
def text_to_speech(marathi_text, output_file="output.wav"):
    """Convert Marathi text to speech using eSpeak-ng"""
    # Clean previous files
    if os.path.exists(output_file):
        os.remove(output_file)
    
    # Prepare PowerShell command with proper encoding
    command = [
        r'C:\Program Files\eSpeak NG\espeak-ng.exe',
        '-v', 'mr+m3',    # Use male voice variant 3
        '-s', '110',      # Speaking speed
        '-a', '180',      # Amplitude (volume)
        '-b', '1',        # UTF-8 input encoding
        '--punct',        # Speak punctuation
        '-w', output_file
    ]
    
    # Execute with text input
    result = subprocess.run(
        command,
        input=marathi_text.encode('utf-8'),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    # Error handling
    if result.returncode != 0:
        error = result.stderr.decode('utf-8', errors='replace')
        raise RuntimeError(f"TTS failed: {error}")
    
    if not os.path.exists(output_file) or os.path.getsize(output_file) == 0:
        raise RuntimeError("Generated audio file is empty")
    
    return output_file

# Main Execution ==============================================================
if __name__ == "__main__":
    try:
        # Step 1: Extract text
        print("📄 Extracting text from PDF...")
        english_text = extract_text_from_pdf("sample.pdf")
        print(f"Extracted text preview:\n{english_text[:200]}...\n")
        
        # Step 2: Translate
        print("🌍 Translating to Marathi...")
        marathi_text = translate_to_marathi(english_text)
        print(f"Translated text preview:\n{marathi_text[:200]}...\n")
        
        # Step 3: Generate Audio
        print("🔊 Generating audio...")
        audio_file = text_to_speech(marathi_text)
        print(f"\n✅ Success! Audio saved to: {os.path.abspath(audio_file)}")
        print(f"File size: {os.path.getsize(audio_file)/1024:.2f} KB")
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")