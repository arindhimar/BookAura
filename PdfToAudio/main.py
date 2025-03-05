import os
import re

import pdfplumber

def extract_text_from_pdf(pdf_path):
    text_content = ''
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                text_content += text + '\n'
    return text_content

from langdetect import detect, DetectorFactory
from langdetect.lang_detect_exception import LangDetectException

# Ensure consistent results
DetectorFactory.seed = 0

def detect_language(text):
    try:
        return detect(text)
    except LangDetectException:
        return 'unknown'


from gtts import gTTS
from pydub import AudioSegment

def text_to_speech(text, lang, filename):
    tts = gTTS(text=text, lang=lang)
    tts.save(filename)


def create_audiobook_from_pdf(pdf_path, output_audio_path):
    # Extract text from PDF
    text_content = extract_text_from_pdf(pdf_path)

    # Split text into segments based on sentence boundaries
    segments = re.split(r'(?<=\.)\s+', text_content)

    # Initialize an empty AudioSegment
    audiobook = AudioSegment.silent(duration=0)

    for i, segment in enumerate(segments):
        # Detect language
        lang = detect_language(segment)
        if lang not in ['en', 'mr']:
            lang = 'en'  # Default to English if detection fails

        # Convert text segment to speech
        temp_filename = f'temp_segment_{i}.mp3'
        text_to_speech(segment, lang, temp_filename)

        # Load the generated speech and append to the audiobook
        speech = AudioSegment.from_file(temp_filename)
        audiobook += speech

        # Remove temporary file
        os.remove(temp_filename)

    # Export the final audiobook
    audiobook.export(output_audio_path, format='mp3')
    

if __name__ == '__main__':
    pdf_path = 'input.pdf'
    output_audio_path = 'output_audiobook.mp3'
    create_audiobook_from_pdf(pdf_path, output_audio_path)

