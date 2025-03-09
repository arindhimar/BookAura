import fitz  # PyMuPDF
import concurrent.futures
from deep_translator import GoogleTranslator
from gtts import gTTS

# Extract text from PDF
def extract_text_from_pdf(pdf_path):
    doc = fitz.open(pdf_path)
    text = "\n".join([page.get_text("text") for page in doc])
    return text

# Split text into chunks (≤5000 characters)
def split_text(text, max_length=5000):
    chunks = []
    while len(text) > max_length:
        split_index = text[:max_length].rfind(" ")
        if split_index == -1:  # If no space found, force split
            split_index = max_length
        chunks.append(text[:split_index])
        text = text[split_index:].lstrip()
    chunks.append(text)
    return chunks

# Translate a single chunk (for parallel execution)
def translate_chunk(chunk):
    translator = GoogleTranslator(source="en", target="mr")
    return translator.translate(chunk)

# Translate text using multiple threads
def translate_text(text):
    text_chunks = split_text(text)
    translated_chunks = []
    
    with concurrent.futures.ThreadPoolExecutor() as executor:
        results = executor.map(translate_chunk, text_chunks)
    
    translated_chunks.extend(results)
    return " ".join(translated_chunks)

# Convert Marathi text to speech
def text_to_speech(text, output_audio_path):
    tts = gTTS(text=text, lang="mr")
    tts.save(output_audio_path)

# File paths
pdf_path = "sample.pdf"
audio_output_path = "marathi.mp3"

# Run the pipeline
english_text = extract_text_from_pdf(pdf_path)
marathi_text = translate_text(english_text)  # Now runs in parallel!
text_to_speech(marathi_text, audio_output_path)

print("✅ Process completed. Audio saved as:", audio_output_path)
