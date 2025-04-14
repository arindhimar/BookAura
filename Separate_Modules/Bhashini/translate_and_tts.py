import requests
import re
import time
import base64

TRANSLATE_URL = "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/compute"
TRANSLATE_MODEL_ID = "641d1d7c8ecee6735a1b37c3"  # English → Marathi
TTS_MODEL_ID = "633c02befd966563f61bc2be"        # Marathi TTS
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

def translate_chunk(text):
    payload = {
        "modelId": TRANSLATE_MODEL_ID,
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

def tts_chunk(text):
    payload = {
        "modelId": TTS_MODEL_ID,
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

def translate_text_chunked(text):
    print("🔄 Translating text (chunked)…")
    text = sanitize_text(text)
    chunks = split_into_chunks(text, TRANSLATE_CHUNK_SIZE)
    print(f"🔀 Splitting into {len(chunks)} chunks for translation…")

    result = []
    for i, chunk in enumerate(chunks):
        print(f"↔️ Translating chunk {i+1}/{len(chunks)}…")
        translated = translate_chunk(chunk)
        result.append(translated)
        time.sleep(0.6)
    return "\n".join(result)

def generate_tts_audio(text):
    print("🎤 Generating TTS audio (chunked)…")
    chunks = split_into_chunks(text, TTS_CHUNK_SIZE)
    print(f"🔊 Splitting into {len(chunks)} chunks for TTS…")

    audio_data = b""
    for i, chunk in enumerate(chunks):
        print(f"🎙️ Processing TTS chunk {i+1}/{len(chunks)}…")
        audio_chunk = tts_chunk(chunk)
        if audio_chunk:
            audio_data += audio_chunk
        time.sleep(0.6)
    return audio_data

if __name__ == "__main__":
    try:
        with open("input.txt", "r", encoding="utf-8") as f:
            raw = f.read()
    except FileNotFoundError:
        print("❌ 'input.txt' not found. Please ensure the file exists.")
        exit(1)

    translated = translate_text_chunked(raw)

    with open("output_marathi.txt", "w", encoding="utf-8") as f:
        f.write(translated)

    audio = generate_tts_audio(translated)

    with open("output_marathi.wav", "wb") as f:
        f.write(audio)

    print("✅ Translation and TTS completed. Files saved as:")
    print("   📄 output_marathi.txt")
    print("   🔊 output_marathi.wav")
