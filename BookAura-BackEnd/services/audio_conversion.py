import os
import time
import requests
import base64
import argparse
from pydub import AudioSegment

# Configuration - Replace with actual model IDs from ULCA documentation
MODEL_IDS = {
    "marathi": "6576a25f4e7d42484da63537",  # Current working Marathi model
    "hindi": "633c021bfb796d5e100d4ff9"           # Replace with Hindi model ID
}

GENDER_MAPPING = {
    "marathi": "female",
    "hindi": "female"
}

def split_text_into_chunks(text, chunk_size=5000):
    """Split text into chunks without breaking words"""
    chunks = []
    while len(text) > chunk_size:
        split_index = text.rfind(" ", 0, chunk_size)
        split_index = chunk_size if split_index == -1 else split_index
        chunks.append(text[:split_index].strip())
        text = text[split_index:].strip()
    chunks.append(text)
    return chunks

def convert_text_to_speech(input_file, language, output_dir="audio_output", chunk_size=5000):
    """Convert translated text to audio with language-specific settings"""
    # Validate language support
    if language not in MODEL_IDS:
        raise ValueError(f"Unsupported language: {language}")
    
    # Create language-specific output directory
    lang_dir = os.path.join(output_dir, language)
    os.makedirs(lang_dir, exist_ok=True)

    with open(input_file, "r", encoding="utf-8") as f:
        full_text = f.read()

    chunks = split_text_into_chunks(full_text, chunk_size)
    audio_files = []

    for index, chunk in enumerate(chunks):
        success = False
        for attempt in range(3):  # Retry mechanism
            try:
                print(f"Processing {language} chunk {index+1}/{len(chunks)} (Attempt {attempt+1})")
                
                payload = {
                    "modelId": MODEL_IDS[language],
                    "task": "tts",
                    "input": [{"source": chunk}],
                    "gender": GENDER_MAPPING[language],
                    "userId": None
                }

                response = requests.post(
                    "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/compute",
                    json=payload,
                    headers={"Content-Type": "application/json"},
                    timeout=30
                )

                if response.status_code == 200:
                    audio_content = response.json().get("audio", [{}])[0].get("audioContent")
                    if audio_content:
                        audio_data = base64.b64decode(audio_content)
                        output_file = os.path.join(lang_dir, f"audio_{index+1}.wav")
                        with open(output_file, "wb") as audio_file:
                            audio_file.write(audio_data)
                        audio_files.append(output_file)
                        print(f"Saved {output_file}")
                        success = True
                        break
                else:
                    print(f"Chunk {index+1} failed. Status: {response.status_code}, Response: {response.text}")

                time.sleep(2 ** attempt)  # Exponential backoff

            except Exception as e:
                print(f"Attempt {attempt+1} failed: {str(e)}")
                time.sleep(2 ** attempt)

        if not success:
            print(f"Failed to process {language} chunk {index+1} after 3 attempts")

    # Combine audio files
    if len(audio_files) > 0:
        combined_audio = AudioSegment.empty()
        for audio_file in audio_files:
            combined_audio += AudioSegment.from_wav(audio_file)
        
        combined_path = os.path.join(output_dir, f"combined_{language}.wav")
        combined_audio.export(combined_path, format="wav")
        print(f"Created combined audio: {combined_path}")
        return combined_path

    return None

def main():
    parser = argparse.ArgumentParser(description="Convert translated text to speech")
    parser.add_argument("--input", required=True, help="Translated text file path")
    parser.add_argument("--output", default="audio_output", help="Output directory")
    parser.add_argument("--language", required=True, choices=["marathi", "hindi"], 
                      help="Target language for TTS")
    args = parser.parse_args()

    start_time = time.time()
    print(f"Starting {args.language} TTS conversion...")
    
    result = convert_text_to_speech(
        input_file=args.input,
        language=args.language,
        output_dir=args.output,
        chunk_size=5000
    )

    duration = time.time() - start_time
    print(f"Completed in {duration:.2f} seconds")
    print(f"Final output: {result if result else 'Conversion failed'}")

if __name__ == "__main__":
    main()