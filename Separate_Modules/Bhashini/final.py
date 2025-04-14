import pyttsx3
import requests
import argparse
import re
import time
import base64
import fitz  # PyMuPDF for PDF processing

# URLs and model IDs for translation and TTS
TRANSLATE_URL = "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/compute"
MARATHI_TRANSLATE_MODEL_ID = "641d1d7c8ecee6735a1b37c3"  # English → Marathi
HINDI_TRANSLATE_MODEL_ID = "641d1d6592a6a31751ff1f49"   # English → Hindi
MARATHI_TTS_MODEL_ID = "633c02befd966563f61bc2be"  # Marathi TTS
HINDI_TTS_MODEL_ID = "633c02befd966563f61bc2be"  # Hindi TTS

TRANSLATE_CHUNK_SIZE = 200000
TTS_CHUNK_SIZE = 25000

def sanitize_text(text):
    text = text.replace("‘", "'").replace("’", "'")
    text = text.replace("“", '"').replace("”", '"')
    text = text.replace("–", "-").replace("…", "...")
    text = re.sub(r'[^\x00-\x7F]+', ' ', text)
    return text

def split_into_chunks(text, chunk_size):
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    chunks, current = [], ""
    for sentence in sentences:
        if len(current) + len(sentence) <= chunk_size:
            current += " " + sentence
        else:
            chunks.append(current.strip())
            current = sentence
    if current:
        chunks.append(current.strip())
    return chunks

def extract_text_from_pdf(pdf_path):
    doc = fitz.open(pdf_path)
    text = ""
    for page_num in range(doc.page_count):
        page = doc.load_page(page_num)
        text += page.get_text("text")
    return text

def translate_chunk(text, model_id):
    payload = {
        "modelId": model_id,
        "task": "translation",
        "input": [{"source": text}],
        "userId": None
    }

    try:
        response = requests.post(TRANSLATE_URL, json=payload)
        response.raise_for_status()
        return response.json()["output"][0]["target"]
    except Exception as e:
        print("[❌ ERROR] Translation failed:", e)
        print("============================================================")
        print(text)
        print("============================================================")
        return "[Translation Failed]"

def tts_chunk(text, model_id):
    payload = {
        "modelId": model_id,
        "task": "tts",
        "input": [{"source": text}],
        "gender": "female",
        "userId": None
    }

    try:
        response = requests.post(TRANSLATE_URL, json=payload)
        response.raise_for_status()
        audio_base64 = response.json()["audio"][0]["audioContent"]
        return base64.b64decode(audio_base64)
    except Exception as e:
        print("[❌ ERROR] TTS failed:", e)
        print("============================================================")
        print(text)
        print("============================================================")
        return None

def translate_text_chunked(text, model_id):
    print(f"🔄 Translating text (chunked) to {model_id}…")
    text = sanitize_text(text)
    chunks = split_into_chunks(text, TRANSLATE_CHUNK_SIZE)
    print(f"🔀 Splitting into {len(chunks)} chunks for translation…")

    result = []
    for i, chunk in enumerate(chunks):
        print(f"↔️ Translating chunk {i+1}/{len(chunks)}…")
        translated = translate_chunk(chunk, model_id)
        result.append(translated)
        time.sleep(0.6)  # Respectful delay
    return "\n".join(result)

def generate_tts_audio(text, model_id):
    print(f"🎤 Generating TTS audio (chunked) for {model_id}…")
    chunks = split_into_chunks(text, TTS_CHUNK_SIZE)
    print(f"🔊 Splitting into {len(chunks)} chunks for TTS…")

    audio_data = b""
    for i, chunk in enumerate(chunks):
        print(f"🎙️ Processing TTS chunk {i+1}/{len(chunks)}…")
        audio_chunk = tts_chunk(chunk, model_id)
        if audio_chunk:
            audio_data += audio_chunk
        time.sleep(0.6)  # Respectful delay
    return audio_data

def generate_english_tts(text, output_path="output_english.wav"):
    print("🎤 Generating English TTS using pyttsx3…")
    try:
        engine = pyttsx3.init()
        engine.setProperty("rate", 150)  # Adjust speaking speed
        engine.save_to_file(text, output_path)
        engine.runAndWait()
        print(f"✅ English TTS audio saved as {output_path}")
    except Exception as e:
        print(f"[❌ ERROR] English TTS failed: {e}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Translate and convert PDF text to speech in Marathi and Hindi.")
    parser.add_argument("pdf_path", help="Path to the input PDF file")
    args = parser.parse_args()

    try:
        text = extract_text_from_pdf(args.pdf_path)
    except Exception as e:
        print(f"❌ Failed to read PDF: {e}")
        exit(1)

    print("🔄 Translating text to Marathi…")
    marathi_text = translate_text_chunked(text, MARATHI_TRANSLATE_MODEL_ID)
    with open("output_marathi.txt", "w", encoding="utf-8") as f:
        f.write(marathi_text)
    print("✅ Marathi translation saved to output_marathi.txt")

    print("🔄 Translating text to Hindi…")
    hindi_text = translate_text_chunked(text, HINDI_TRANSLATE_MODEL_ID)
    with open("output_hindi.txt", "w", encoding="utf-8") as f:
        f.write(hindi_text)
    print("✅ Hindi translation saved to output_hindi.txt")

    print("🎤 Generating Marathi TTS audio…")
    marathi_audio = generate_tts_audio(marathi_text, MARATHI_TTS_MODEL_ID)
    with open("output_marathi.wav", "wb") as f:
        f.write(marathi_audio)
    print("✅ Marathi TTS audio saved as output_marathi.wav")

    print("🎤 Generating Hindi TTS audio…")
    hindi_audio = generate_tts_audio(hindi_text, HINDI_TTS_MODEL_ID)
    with open("output_hindi.wav", "wb") as f:
        f.write(hindi_audio)
    print("✅ Hindi TTS audio saved as output_hindi.wav")

    generate_english_tts(text, "output_english.wav")

    print("✅ Translation and TTS completed for both languages.")