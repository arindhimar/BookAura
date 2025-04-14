import argparse
import base64
import logging
import os
import re
import sys
import time
import traceback
from pathlib import Path

import fitz  # PyMuPDF
import pyttsx3
import requests
from pydub import AudioSegment

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('translation.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('translation')

# URLs and model IDs for translation and TTS
TRANSLATE_URL = "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/compute"
MARATHI_TRANSLATE_MODEL_ID = "641d1d7c8ecee6735a1b37c3"  # English → Marathi
HINDI_TRANSLATE_MODEL_ID = "641d1d6592a6a31751ff1f49"   # English → Hindi
MARATHI_TTS_MODEL_ID = "6576a25f4e7d42484da63537"  # Marathi TTS - Updated model ID
HINDI_TTS_MODEL_ID = "633c021bfb796d5e100d4ff9"  # Hindi TTS - Updated model ID

# Chunk sizes optimized for API limits
TRANSLATE_CHUNK_SIZE = 200000  # Reduced to avoid API limits
TTS_CHUNK_SIZE = 1000  # Reduced to avoid API limits

def sanitize_text(text):
    """Clean text of problematic characters for translation and TTS"""
    text = text.replace("'", "'").replace("'", "'")
    text = text.replace(""", '"').replace(""", '"')
    text = text.replace("–", "-").replace("…", "...")
    # Remove non-ASCII characters that might cause issues
    text = re.sub(r'[^\x00-\x7F]+', ' ', text)
    return text

def split_into_chunks(text, chunk_size):
    """Split text into manageable chunks at sentence boundaries"""
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    chunks, current = [], ""
    
    for sentence in sentences:
        if len(current) + len(sentence) <= chunk_size:
            current += " " + sentence if current else sentence
        else:
            if current:
                chunks.append(current.strip())
            current = sentence
    
    if current:
        chunks.append(current.strip())
    
    return chunks

def extract_text_from_pdf(pdf_path):
    """Extract text from PDF using PyMuPDF (fitz)"""
    try:
        logger.info(f"Extracting text from PDF: {pdf_path}")
        doc = fitz.open(pdf_path)
        text = ""
        
        for page_num in range(doc.page_count):
            page = doc.load_page(page_num)
            text += page.get_text("text") + "\n"
            
        logger.info(f"Successfully extracted {len(text)} characters from PDF")
        return text
    except Exception as e:
        logger.error(f"Failed to extract text from PDF: {e}")
        logger.error(traceback.format_exc())
        return ""

def translate_chunk(text, model_id, target_lang):
    """Translate a chunk of text"""
    payload = {
        "modelId": model_id,
        "task": "translation",
        "input": [{"source": text}],
        "userId": None
    }
    
    headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) BookAuraBackend/1.0'
    }

    try:
        logger.info(f"Sending translation request for {target_lang} chunk of size {len(text)}")
        response = requests.post(TRANSLATE_URL, json=payload, headers=headers, timeout=60)
        response.raise_for_status()
        
        result = response.json()
        if "output" in result and len(result["output"]) > 0 and "target" in result["output"][0]:
            translated = result["output"][0]["target"]
            logger.info(f"Successfully translated chunk to {target_lang} ({len(translated)} chars)")
            return translated
        else:
            logger.error(f"Unexpected response format: {result}")
            return None
    except Exception as e:
        logger.error(f"Translation failed for {target_lang}: {e}")
        if 'response' in locals():
            logger.error(f"Response status: {response.status_code}")
            logger.error(f"Response content: {response.text[:500]}...")
        return None

def tts_chunk(text, model_id, language):
    """Convert text to speech"""
    payload = {
        "modelId": model_id,
        "task": "tts",
        "input": [{"source": text}],
        "gender": "female",
        "userId": None
    }
    
    headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) BookAuraBackend/1.0'
    }

    try:
        logger.info(f"Sending TTS request for {language} chunk of size {len(text)}")
        response = requests.post(TRANSLATE_URL, json=payload, headers=headers, timeout=60)
        response.raise_for_status()
        
        result = response.json()
        if "audio" in result and len(result["audio"]) > 0 and "audioContent" in result["audio"][0]:
            audio_base64 = result["audio"][0]["audioContent"]
            logger.info(f"Successfully received audio for {language} chunk")
            return base64.b64decode(audio_base64)
        else:
            logger.error(f"Unexpected TTS response format: {result}")
            return None
    except Exception as e:
        logger.error(f"TTS failed for {language}: {e}")
        if 'response' in locals():
            logger.error(f"Response status: {response.status_code}")
            logger.error(f"Response content: {response.text[:500]}...")
        return None

def translate_text_chunked(text, model_id, target_lang):
    """Translate text in chunks and combine results"""
    logger.info(f"Translating text to {target_lang}...")
    text = sanitize_text(text)
    chunks = split_into_chunks(text, TRANSLATE_CHUNK_SIZE)
    logger.info(f"Split into {len(chunks)} chunks for translation")
    
    result = []
    for i, chunk in enumerate(chunks):
        logger.info(f"Translating chunk {i+1}/{len(chunks)} to {target_lang}")
        translated = translate_chunk(chunk, model_id, target_lang)
        
        if translated:
            result.append(translated)
            # Log progress periodically
            if (i+1) % 5 == 0 or i+1 == len(chunks):
                logger.info(f"Progress: {i+1}/{len(chunks)} chunks translated to {target_lang}")
        else:
            logger.warning(f"Failed to translate chunk {i+1} to {target_lang}")
            result.append(f"[Translation Failed for Chunk {i+1}]")
            
        # Respectful delay between API calls
        time.sleep(1.5)
    
    translated_text = "\n".join(result)
    logger.info(f"Translation to {target_lang} completed: {len(translated_text)} characters")
    return translated_text

def generate_tts_audio(text, model_id, language):
    """Generate TTS audio in chunks"""
    logger.info(f"Generating TTS audio for {language}...")
    chunks = split_into_chunks(text, TTS_CHUNK_SIZE)
    logger.info(f"Split into {len(chunks)} chunks for TTS")
    
    audio_chunks = []
    for i, chunk in enumerate(chunks):
        logger.info(f"Processing TTS chunk {i+1}/{len(chunks)} for {language}")
        audio_chunk = tts_chunk(chunk, model_id, language)
        
        if audio_chunk:
            audio_chunks.append(audio_chunk)
            # Log progress periodically
            if (i+1) % 5 == 0 or i+1 == len(chunks):
                logger.info(f"Progress: {i+1}/{len(chunks)} TTS chunks processed for {language}")
        else:
            logger.warning(f"Failed to generate audio for chunk {i+1} for {language}")
            
        # Respectful delay between API calls
        time.sleep(1.5)
    
    if not audio_chunks:
        logger.error(f"No audio chunks were successfully generated for {language}")
        return None
    
    logger.info(f"Combining {len(audio_chunks)} audio chunks for {language}")
    audio_data = b"".join(audio_chunks)
    logger.info(f"Combined audio data size: {len(audio_data)} bytes")
    return audio_data

def generate_english_tts(text, output_path):
    """Generate English TTS using pyttsx3"""
    try:
        logger.info(f"Generating English TTS using pyttsx3...")
        engine = pyttsx3.init()
        engine.setProperty('rate', 150)  # Adjust speaking speed
        engine.save_to_file(text, output_path)
        engine.runAndWait()
        logger.info(f"English TTS audio saved to {output_path}")
        return True
    except Exception as e:
        logger.error(f"English TTS failed: {e}")
        logger.error(traceback.format_exc())
        return False

def save_debug_info(text, translated_text, language, debug_folder, base_name):
    """Save original and translated text for debugging"""
    try:
        os.makedirs(debug_folder, exist_ok=True)
        
        # Save original text if it's the first language
        if language == "mr":  # Only save once
            with open(os.path.join(debug_folder, f"{base_name}_original.txt"), "w", encoding="utf-8") as f:
                f.write(text)
            logger.info(f"Saved original text to debug folder")
        
        # Save translated text
        with open(os.path.join(debug_folder, f"{base_name}_{language}.txt"), "w", encoding="utf-8") as f:
            f.write(translated_text)
        logger.info(f"Saved {language} translation to debug folder")
    except Exception as e:
        logger.error(f"Failed to save debug info: {e}")

def process_pdf(pdf_path):
    """Main function to process a PDF file"""
    try:
        logger.info(f"Starting to process PDF: {pdf_path}")
        
        # Validate PDF path
        if not os.path.exists(pdf_path):
            logger.error(f"PDF file not found: {pdf_path}")
            return False
        
        # Extract text from PDF
        text = extract_text_from_pdf(pdf_path)
        if not text:
            logger.error("Failed to extract text from PDF")
            return False
        
        # Determine output paths
        base_name = os.path.splitext(os.path.basename(pdf_path))[0]
        if base_name.endswith('_en'):
            base_name = base_name[:-3]  # Remove _en if present
            
        output_folder = os.path.abspath(os.path.join(os.path.dirname(pdf_path), "..", "audio_uploads"))
        os.makedirs(output_folder, exist_ok=True)
        
        debug_folder = os.path.join(output_folder, "debug")
        os.makedirs(debug_folder, exist_ok=True)
        
        en_path = os.path.join(output_folder, f"{base_name}_en.mp3")
        mr_path = os.path.join(output_folder, f"{base_name}_mr.mp3")
        hi_path = os.path.join(output_folder, f"{base_name}_hi.mp3")
        
        # Track success of each step
        english_success = False
        marathi_success = False
        hindi_success = False
        
        # Generate English TTS
        try:
            logger.info("Starting English TTS generation...")
            english_success = generate_english_tts(text, en_path)
            logger.info(f"English TTS generation {'succeeded' if english_success else 'failed'}")
        except Exception as e:
            logger.error(f"Exception during English TTS generation: {e}")
            logger.error(traceback.format_exc())
        
        # Translate to Marathi and generate TTS
        try:
            logger.info("Starting Marathi translation...")
            marathi_text = translate_text_chunked(text, MARATHI_TRANSLATE_MODEL_ID, "mr")
            
            if marathi_text:
                # Save Marathi translation for debugging
                save_debug_info(text, marathi_text, "mr", debug_folder, base_name)
                
                # Generate Marathi TTS
                logger.info("Starting Marathi TTS generation...")
                marathi_audio = generate_tts_audio(marathi_text, MARATHI_TTS_MODEL_ID, "mr")
                
                if marathi_audio:
                    with open(mr_path, "wb") as f:
                        f.write(marathi_audio)
                    logger.info(f"Marathi TTS audio saved as {mr_path}")
                    marathi_success = True
                else:
                    logger.error("Failed to generate Marathi audio")
            else:
                logger.error("Translation to Marathi failed")
        except Exception as e:
            logger.error(f"Exception during Marathi processing: {e}")
            logger.error(traceback.format_exc())
        
        # Translate to Hindi and generate TTS
        try:
            logger.info("Starting Hindi translation...")
            hindi_text = translate_text_chunked(text, HINDI_TRANSLATE_MODEL_ID, "hi")
            
            if hindi_text:
                # Save Hindi translation for debugging
                save_debug_info(text, hindi_text, "hi", debug_folder, base_name)
                
                # Generate Hindi TTS
                logger.info("Starting Hindi TTS generation...")
                hindi_audio = generate_tts_audio(hindi_text, HINDI_TTS_MODEL_ID, "hi")
                
                if hindi_audio:
                    with open(hi_path, "wb") as f:
                        f.write(hindi_audio)
                    logger.info(f"Hindi TTS audio saved as {hi_path}")
                    hindi_success = True
                else:
                    logger.error("Failed to generate Hindi audio")
            else:
                logger.error("Translation to Hindi failed")
        except Exception as e:
            logger.error(f"Exception during Hindi processing: {e}")
            logger.error(traceback.format_exc())
        
        # Report success
        logger.info(f"Processing complete: English: {english_success}, Marathi: {marathi_success}, Hindi: {hindi_success}")
        
        # Call the API to mark the book as approved if at least one conversion succeeded
        if english_success or marathi_success or hindi_success:
            try:
                # Extract book_id from filename if possible
                book_id_match = re.search(r'book_(\d+)', base_name)
                if book_id_match:
                    book_id = book_id_match.group(1)
                    logger.info(f"Extracted book_id {book_id} from filename, marking as approved")
                    # You would call your API here to mark the book as approved
                else:
                    logger.info("No book_id found in filename, skipping approval")
            except Exception as e:
                logger.error(f"Error marking book as approved: {e}")
        
        return english_success or marathi_success or hindi_success
        
    except Exception as e:
        logger.error(f"Error processing PDF: {e}")
        logger.error(traceback.format_exc())
        return False

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Process PDF for translation and TTS")
    parser.add_argument("pdf_path", help="Path to the PDF file to process")
    parser.add_argument("--debug", action="store_true", help="Enable debug mode with more verbose logging")
    
    args = parser.parse_args()
    
    if args.debug:
        logger.setLevel(logging.DEBUG)
        logger.debug("Debug mode enabled")
    
    pdf_path = os.path.abspath(args.pdf_path)
    logger.info(f"Processing PDF: {pdf_path}")
    
    success = process_pdf(pdf_path)
    sys.exit(0 if success else 1)