import pdfplumber
import pyttsx3
import re
import os
import torch
from langdetect import detect, DetectorFactory
from TTS.api import TTS  # Coqui TTS
from pydub import AudioSegment

# Ensure consistent language detection
DetectorFactory.seed = 0

# Initialize text-to-speech engine for English
engine = pyttsx3.init()

# Load Coqui TTS Marathi model
marathi_tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2")

# Function to extract text from PDF
def extract_text_from_pdf(pdf_path):
    text_content = ''
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                text_content += text + '\n'
    return text_content

# Function to detect language
def detect_language(text):
    try:
        return detect(text)
    except:
        return 'en'  # Default to English if detection fails

# Function to convert text to speech
def text_to_speech(text, lang, filename):
    if lang == 'mr':
        # Use Coqui TTS for Marathi
        marathi_tts.tts_to_file(text=text, speaker_wav=None, language="mr", file_path=filename)
    else:
        # Use pyttsx3 for English
        engine.setProperty('rate', 150)  # Set speech speed
        voices = engine.getProperty('voices')
        
        for voice in voices:
            if 'English' in voice.name:
                engine.setProperty('voice', voice.id)
                break
        
        engine.save_to_file(text, filename)
        engine.runAndWait()

# Function to create audiobook
def create_audiobook_from_pdf(pdf_path, output_audio_path):
    text_content = extract_text_from_pdf(pdf_path)
    segments = re.split(r'(?<=\.)\s+', text_content)  # Split by sentence

    audiobook = AudioSegment.silent(duration=0)

    for i, segment in enumerate(segments):
        lang = detect_language(segment)
        temp_filename = f'temp_segment_{i}.wav'
        text_to_speech(segment, lang, temp_filename)

        # Load generated speech and append to the audiobook
        speech = AudioSegment.from_file(temp_filename)
        audiobook += speech

        # Remove temp file
        os.remove(temp_filename)

    # Save the final audiobook
    audiobook.export(output_audio_path, format='mp3')
    print(f"Audiobook saved as {output_audio_path}")

# Run the script
if __name__ == '__main__':
    pdf_path = 'input.pdf'  # Replace with actual PDF path
    output_audio_path = 'audiobook.mp3'
    create_audiobook_from_pdf(pdf_path, output_audio_path)
