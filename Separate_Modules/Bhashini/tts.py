import os
import time
import requests
import base64
import json
import pdfplumber
from pydub import AudioSegment

# PDF Processing and Translation Functions
def extract_text_from_pdf(pdf_path):
    """Extracts text from a PDF file."""
    text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                text += page.extract_text() + "\n" if page.extract_text() else ""
        return text.strip()
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return None

def translate_text(text, source_lang="en", target_lang="mr"):
    """Translates text using the AI4Bharat API."""
    url = 'https://admin.models.ai4bharat.org/inference/translate'
    payload = {
        "sourceLanguage": source_lang,
        "targetLanguage": target_lang,
        "input": text,
        "task": "translation",
        "serviceId": "ai4bharat/indictrans--gpu-t4",
        "track": True
    }
    headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=100, verify=True)
        response.raise_for_status()
        response_data = response.json()

        if "output" in response_data and len(response_data["output"]) > 0:
            return response_data["output"][0]["target"]
        else:
            print("Error: No translation found in the response.")
            return None
    except Exception as e:
        print(f"Error during translation: {e}")
        return None

def process_pdf_to_translation(pdf_path, extracted_text_file, translated_text_file):
    """Full pipeline: Extract text from PDF, translate, and save results."""
    # Extract text from PDF
    extracted_text = extract_text_from_pdf(pdf_path)
    if not extracted_text:
        print("Failed to extract text from PDF")
        return False

    # Save extracted text
    try:
        with open(extracted_text_file, "w", encoding="utf-8") as f:
            f.write(extracted_text)
        print(f"Extracted text saved to {extracted_text_file}")
    except Exception as e:
        print(f"Error saving extracted text: {e}")
        return False

    # Translate text
    translated_text = translate_text(extracted_text)
    if not translated_text:
        print("Translation failed")
        return False

    # Save translated text
    try:
        with open(translated_text_file, "w", encoding="utf-8") as f:
            f.write(translated_text)
        print(f"Translated text saved to {translated_text_file}")
        return True
    except Exception as e:
        print(f"Error saving translation: {e}")
        return False

# Text to Speech Functions
def split_text_into_chunks(text, chunk_size=5000):
    """Split text into chunks without breaking words."""
    chunks = []
    while len(text) > chunk_size:
        split_index = text.rfind(" ", 0, chunk_size)
        if split_index == -1:
            split_index = chunk_size
        chunks.append(text[:split_index].strip())
        text = text[split_index:].strip()
    chunks.append(text)
    return chunks

def convert_text_to_speech(input_file, output_dir="audio_output", chunk_size=5000):
    """Convert translated text to speech using ULCA TTS API."""
    os.makedirs(output_dir, exist_ok=True)
    
    with open(input_file, "r", encoding="utf-8") as f:
        full_text = f.read()

    chunks = split_text_into_chunks(full_text, chunk_size)
    audio_files = []

    for index, chunk in enumerate(chunks):
        print(f"Processing chunk {index+1}/{len(chunks)}")
        
        payload = {
            "modelId": "6576a25f4e7d42484da63537",
            "task": "tts",
            "input": [{"source": chunk}],
            "gender": "female",
            "userId": None
        }

        try:
            response = requests.post(
                "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/compute",
                json=payload,
                headers={"Content-Type": "application/json"}
            )

            if response.status_code == 200:
                audio_content = response.json().get("audio", [{}])[0].get("audioContent")
                if audio_content:
                    output_file = os.path.join(output_dir, f"audio_{index+1}.wav")
                    with open(output_file, "wb") as f:
                        f.write(base64.b64decode(audio_content))
                    audio_files.append(output_file)
                    print(f"Saved {output_file}")
                else:
                    print(f"No audio content in chunk {index+1}")
            else:
                print(f"Chunk {index+1} failed: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"Error processing chunk {index+1}: {str(e)}")

    # Combine audio files if multiple chunks
    if len(audio_files) > 1:
        combined = AudioSegment.empty()
        for file in audio_files:
            combined += AudioSegment.from_wav(file)
        combined_file = os.path.join(output_dir, "combined_audio.wav")
        combined.export(combined_file, format="wav")
        print(f"Combined audio saved to {combined_file}")

    print("Text-to-speech conversion completed.")

if __name__ == "__main__":
    # Configuration
    PDF_PATH = "sample.pdf"
    EXTRACTED_TEXT_FILE = "extracted_text.txt"
    TRANSLATED_TEXT_FILE = "translated_text.txt"
    AUDIO_OUTPUT_DIR = "audio_output"

    # Step 1: Process PDF to translated text
    if not process_pdf_to_translation(PDF_PATH, EXTRACTED_TEXT_FILE, TRANSLATED_TEXT_FILE):
        print("Stopping execution due to processing errors")
        exit(1)

    # Step 2: Convert translated text to speech
    convert_text_to_speech(
        input_file=TRANSLATED_TEXT_FILE,
        output_dir=AUDIO_OUTPUT_DIR,
        chunk_size=5000  # Adjust based on API limits
    )