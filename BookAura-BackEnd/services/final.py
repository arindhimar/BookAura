import os
import sys
import re
import time
import base64
import requests
import pyttsx3
import fitz  # PyMuPDF
from pydub import AudioSegment
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('audio_conversion.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('audio_conversion')

# URLs and model IDs for translation and TTS
TRANSLATE_URL = "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/compute"
MARATHI_TRANSLATE_MODEL_ID = "641d1d7c8ecee6735a1b37c3"  # English → Marathi
HINDI_TRANSLATE_MODEL_ID = "641d1d6592a6a31751ff1f49"   # English → Hindi
MARATHI_TTS_MODEL_ID = "6576a25f4e7d42484da63537"  # Marathi TTS
HINDI_TTS_MODEL_ID = "633c021bfb796d5e100d4ff9"  # Hindi TTS

TRANSLATE_CHUNK_SIZE = 200000  # Smaller chunks for more reliable translation
TTS_CHUNK_SIZE = 25000  # Smaller chunks for more reliable TTS

def sanitize_text(text):
    """Clean text of problematic characters for translation and TTS"""
    text = text.replace("'", "'").replace("'", "'")
    text = text.replace(""", '"').replace(""", '"')
    text = text.replace("–", "-").replace("…", "...")
    text = re.sub(r'[^\x00-\x7F\u0900-\u097F\u0980-\u09FF]+', ' ', text)  # Keep English and Indic chars
    return text

def split_into_chunks(text, chunk_size):
    """Split text into manageable chunks at sentence boundaries"""
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    chunks, current = [], ""
    for sentence in sentences:
        if len(current) + len(sentence) <= chunk_size:
            current += " " + sentence
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
        return ""

def translate_chunk(text, model_id, target_lang, max_retries=3):
    """Translate a chunk of text with retry logic"""
    for attempt in range(max_retries):
        try:
            logger.info(f"Translation attempt {attempt+1}/{max_retries} for {target_lang}")
            
            payload = {
                "sourceLanguage": "en",
                "targetLanguage": target_lang,
                "input": text,
                "task": "translation",
                "modelId": model_id,
                "track": True
            }
            
            headers = {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) BookAuraBackend/1.0'
            }
            
            response = requests.post(TRANSLATE_URL, json=payload, headers=headers, timeout=60)
            response.raise_for_status()
            
            result = response.json()
            if "output" in result and len(result["output"]) > 0 and "target" in result["output"][0]:
                return result["output"][0]["target"]
            else:
                logger.error(f"Invalid response format: {result}")
        except Exception as e:
            logger.error(f"Translation error on attempt {attempt+1}: {e}")
            if attempt < max_retries - 1:
                time.sleep(2 * (attempt + 1))  # Exponential backoff
    
    logger.error(f"All translation attempts failed for {target_lang}")
    return f"[Translation Failed for {target_lang}]"

def tts_chunk(text, model_id, language, max_retries=3):
    """Convert text to speech with retry logic"""
    for attempt in range(max_retries):
        try:
            logger.info(f"TTS attempt {attempt+1}/{max_retries} for {language}")
            
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
            
            response = requests.post(
                "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/compute",
                json=payload,
                headers=headers,
                timeout=60
            )
            response.raise_for_status()
            
            result = response.json()
            audio_content = result.get("audio", [{}])[0].get("audioContent")
            
            if audio_content:
                return base64.b64decode(audio_content)
            else:
                logger.error(f"No audio content in response: {result}")
        except Exception as e:
            logger.error(f"TTS error on attempt {attempt+1}: {e}")
            if attempt < max_retries - 1:
                time.sleep(2 * (attempt + 1))  # Exponential backoff
    
    logger.error(f"All TTS attempts failed for {language}")
    return None

def translate_text_chunked(text, model_id, target_lang):
    """Translate text in chunks and combine results"""
    logger.info(f"Starting translation to {target_lang}")
    text = sanitize_text(text)
    chunks = split_into_chunks(text, TRANSLATE_CHUNK_SIZE)
    logger.info(f"Split text into {len(chunks)} chunks for translation")
    
    result = []
    for i, chunk in enumerate(chunks):
        logger.info(f"Translating chunk {i+1}/{len(chunks)} to {target_lang}")
        translated = translate_chunk(chunk, model_id, target_lang)
        result.append(translated)
        time.sleep(1)  # Rate limiting
    
    translated_text = "\n".join(result)
    logger.info(f"Translation to {target_lang} completed: {len(translated_text)} characters")
    return translated_text

def generate_tts_audio(text, model_id, language, output_path):
    """Generate TTS audio in chunks and save to file"""
    logger.info(f"Starting TTS for {language}")
    chunks = split_into_chunks(text, TTS_CHUNK_SIZE)
    logger.info(f"Split text into {len(chunks)} chunks for TTS")
    
    temp_files = []
    for i, chunk in enumerate(chunks):
        logger.info(f"Processing TTS chunk {i+1}/{len(chunks)} for {language}")
        audio_data = tts_chunk(chunk, model_id, language)
        
        if audio_data:
            temp_file = f"temp_{language}_{i+1}.wav"
            with open(temp_file, "wb") as f:
                f.write(audio_data)
            temp_files.append(temp_file)
            logger.info(f"Saved {language} audio chunk {i+1}")
        else:
            logger.error(f"Failed to generate audio for chunk {i+1}")
        
        time.sleep(1)  # Rate limiting
    
    # Combine audio chunks
    if temp_files:
        try:
            combined = AudioSegment.empty()
            for temp_file in temp_files:
                if os.path.exists(temp_file):
                    segment = AudioSegment.from_wav(temp_file)
                    combined += segment
            
            # Export as MP3
            combined.export(output_path, format="mp3")
            logger.info(f"Combined audio saved to {output_path}")
            
            # Clean up temp files
            for temp_file in temp_files:
                if os.path.exists(temp_file):
                    os.remove(temp_file)
            
            return True
        except Exception as e:
            logger.error(f"Error combining audio files: {e}")
            return False
    else:
        logger.error(f"No audio chunks were generated for {language}")
        return False

def generate_english_tts(text, output_path):
    """Generate English TTS using pyttsx3"""
    try:
        logger.info("Starting English TTS generation")
        engine = pyttsx3.init()
        engine.setProperty('rate', 150)
        engine.save_to_file(text, output_path)
        engine.runAndWait()
        logger.info(f"English TTS audio saved to {output_path}")
        return True
    except Exception as e:
        logger.error(f"English TTS failed: {e}")
        return False

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
            base_name = base_name[:-3]
            
        output_folder = os.path.abspath(os.path.join(os.path.dirname(__file__), "../audio_uploads"))
        os.makedirs(output_folder, exist_ok=True)
        
        en_path = os.path.join(output_folder, f"{base_name}_en.mp3")
        mr_path = os.path.join(output_folder, f"{base_name}_mr.mp3")
        hi_path = os.path.join(output_folder, f"{base_name}_hi.mp3")
        
        # Save original text for debugging
        debug_folder = os.path.join(output_folder, "debug")
        os.makedirs(debug_folder, exist_ok=True)
        with open(os.path.join(debug_folder, f"{base_name}_original.txt"), "w", encoding="utf-8") as f:
            f.write(text)
        
        # Generate English TTS
        english_success = generate_english_tts(text, en_path)
        
        # Translate to Marathi and generate TTS
        marathi_text = translate_text_chunked(text, MARATHI_TRANSLATE_MODEL_ID, "mr")
        with open(os.path.join(debug_folder, f"{base_name}_marathi.txt"), "w", encoding="utf-8") as f:
            f.write(marathi_text)
        marathi_success = generate_tts_audio(marathi_text, MARATHI_TTS_MODEL_ID, "Marathi", mr_path)
        
        # Translate to Hindi and generate TTS
        hindi_text = translate_text_chunked(text, HINDI_TRANSLATE_MODEL_ID, "hi")
        with open(os.path.join(debug_folder, f"{base_name}_hindi.txt"), "w", encoding="utf-8") as f:
            f.write(hindi_text)
        hindi_success = generate_tts_audio(hindi_text, HINDI_TTS_MODEL_ID, "Hindi", hi_path)
        
        # Report success
        logger.info(f"Processing complete: English: {english_success}, Marathi: {marathi_success}, Hindi: {hindi_success}")
        return english_success or marathi_success or hindi_success
        
    except Exception as e:
        logger.error(f"Error processing PDF: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        logger.error("Usage: python final.py <path_to_pdf>")
        sys.exit(1)
    
    pdf_path = os.path.abspath(sys.argv[1])
    success = process_pdf(pdf_path)
    sys.exit(0 if success else 1)
