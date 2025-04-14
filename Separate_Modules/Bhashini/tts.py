import os
import json
import base64
import requests
import pdfplumber
from pydub import AudioSegment

# ──────────────────────────────────────────────────────────────────────────────
# CONFIGURATION
# ──────────────────────────────────────────────────────────────────────────────
PDF_PATH = "sample.pdf"
RAW_TEXT_FILE = "extracted_text.txt"
TRANSLATED_TEXT_FILE = "translated_text.txt"
AUDIO_OUTPUT_DIR = "audio_output"

# These service IDs come from the admin.models.ai4bharat.org UI
TRANSLATION_SERVICE_ID = "ai4bharat/indictrans--gpu-t4"
TTS_SERVICE_ID         = "ai4bharat/indic-tts-indo-aryan--gpu-t4"

HEADERS = {"Content-Type": "application/json"}


# ──────────────────────────────────────────────────────────────────────────────
# 1) PDF → raw text
# ──────────────────────────────────────────────────────────────────────────────
def extract_text_from_pdf(pdf_path):
    text_chunks = []
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                t = page.extract_text()
                if t:
                    text_chunks.append(t)
        return "\n".join(text_chunks).strip()
    except Exception as e:
        print(f"[ERROR] extracting text: {e}")
        return None


# ──────────────────────────────────────────────────────────────────────────────
# 2) Translation via admin.models.ai4bharat.org
# ──────────────────────────────────────────────────────────────────────────────
def translate_text(text,
                   source_lang="en",
                   target_lang="mr",
                   service_id=TRANSLATION_SERVICE_ID,
                   track=True):
    url = "https://admin.models.ai4bharat.org/inference/translate"
    payload = {
        "sourceLanguage": source_lang,
        "targetLanguage": target_lang,
        "input": text,
        "task": "translation",
        "serviceId": service_id,
        "track": track
    }
    try:
        resp = requests.post(url, json=payload, headers=HEADERS, timeout=120)
        resp.raise_for_status()
        data = resp.json()
        return data["output"][0]["target"]
    except Exception as e:
        print(f"[ERROR] translation failed: {e}")
        return None


def process_pdf_to_translation():
    raw = extract_text_from_pdf(PDF_PATH)
    if not raw:
        return False

    # save raw
    with open(RAW_TEXT_FILE, "w", encoding="utf-8") as f:
        f.write(raw)
    print(f"✔ Raw text → {RAW_TEXT_FILE}")

    # translate
    translated = translate_text(raw)
    if not translated:
        return False

    # save translation
    with open(TRANSLATED_TEXT_FILE, "w", encoding="utf-8") as f:
        f.write(translated)
    print(f"✔ Translated text → {TRANSLATED_TEXT_FILE}")
    return True


# ──────────────────────────────────────────────────────────────────────────────
# 3) Text → Speech via admin.models.ai4bharat.org
# ──────────────────────────────────────────────────────────────────────────────
def split_text_into_chunks(text, chunk_size=500):
    chunks = []
    while len(text) > chunk_size:
        idx = text.rfind(" ", 0, chunk_size)
        if idx == -1:
            idx = chunk_size
        chunks.append(text[:idx].strip())
        text = text[idx:].strip()
    if text:
        chunks.append(text)
    return chunks


def tts_chunk(chunk,
              idx,
              service_id=TTS_SERVICE_ID,
              source_lang="mr",
              sampling_rate=16000,
              gender="female",
              track=True):
    url = "https://admin.models.ai4bharat.org/inference/convert"
    payload = {
        "sourceLanguage": source_lang,
        "input": chunk,
        "task": "tts",
        "serviceId": service_id,
        "samplingRate": str(sampling_rate),
        "gender": gender,
        "track": track
    }
    try:
        resp = requests.post(url, json=payload, headers=HEADERS, timeout=120)
        resp.raise_for_status()
        audio_b64 = resp.json()["audio"][0]["audioContent"]
        out_path = os.path.join(AUDIO_OUTPUT_DIR, f"chunk_{idx}.wav")
        with open(out_path, "wb") as wf:
            wf.write(base64.b64decode(audio_b64))
        print(f"✔ Saved TTS chunk {idx} → {out_path}")
        return out_path
    except Exception as e:
        print(f"[ERROR] TTS chunk {idx} failed: {e}")
        return None


def convert_text_to_speech():
    os.makedirs(AUDIO_OUTPUT_DIR, exist_ok=True)
    text = open(TRANSLATED_TEXT_FILE, "r", encoding="utf-8").read()
    chunks = split_text_into_chunks(text, chunk_size=5000)

    wav_files = []
    for i, chunk in enumerate(chunks, 1):
        path = tts_chunk(chunk, i)
        if path:
            wav_files.append(path)

    # combine if more than one
    if len(wav_files) > 1:
        combined = AudioSegment.empty()
        for wav in wav_files:
            combined += AudioSegment.from_wav(wav)
        combo_path = os.path.join(AUDIO_OUTPUT_DIR, "combined_audio.wav")
        combined.export(combo_path, format="wav")
        print(f"✔ Combined audio → {combo_path}")


# ──────────────────────────────────────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    ok = process_pdf_to_translation()
    if not ok:
        print("❌ Aborting.")
        exit(1)
    convert_text_to_speech()
    print("🎉 All done!")
