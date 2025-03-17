import os
import time
import requests
import base64
from pydub import AudioSegment

def split_text_into_chunks(text, chunk_size=5000):
    """
    Split text into chunks of specified size, ensuring words are not cut in half.
    :param text: Input text
    :param chunk_size: Maximum characters per chunk
    :return: List of text chunks
    """
    chunks = []
    while len(text) > chunk_size:
        # Find the last space within the chunk size
        split_index = text.rfind(" ", 0, chunk_size)
        if split_index == -1:
            # If no space is found, force split at chunk_size (not ideal but necessary)
            split_index = chunk_size
        chunks.append(text[:split_index].strip())
        text = text[split_index:].strip()
    chunks.append(text)  # Add the remaining text
    return chunks

def convert_text_to_speech(input_file, output_dir="audio_output", chunk_size=5000):
    """
    Convert text from file to audio using ULCA TTS API
    :param input_file: Path to translated text file
    :param output_dir: Directory to save audio files
    :param chunk_size: Maximum characters per TTS request
    """
    # Create output directory if needed
    os.makedirs(output_dir, exist_ok=True)

    # Read translated text
    with open(input_file, "r", encoding="utf-8") as f:
        full_text = f.read()

    # Split text into chunks without cutting words
    chunks = split_text_into_chunks(full_text, chunk_size)

    audio_files = []  # To store paths of generated audio files

    for index, chunk in enumerate(chunks):
        print(f"Processing chunk {index+1}/{len(chunks)}")

        # Prepare payload
        payload = {
            "modelId": "6576a25f4e7d42484da63537",  # Replace with the correct model ID
            "task": "tts",
            "input": [
                {
                    "source": chunk
                }
            ],
            "gender": "female",  # Specify gender (if required)
            "userId": None  # Replace with user ID if required
        }

        # Send request to ULCA API
        try:
            response = requests.post(
                "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/compute",
                json=payload,
                headers={"Content-Type": "application/json"}
            )

            # Check if the request was successful
            if response.status_code == 200:
                response_data = response.json()
                audio_content = response_data["audio"][0]["audioContent"]

                if audio_content:
                    # Decode the base64 audio data
                    audio_data = base64.b64decode(audio_content)

                    # Save the audio file as WAV
                    output_file = os.path.join(output_dir, f"audio_{index+1}.wav")
                    with open(output_file, "wb") as audio_file:
                        audio_file.write(audio_data)
                    audio_files.append(output_file)
                    print(f"Saved {output_file}")
                else:
                    print(f"No audio content found in the response for chunk {index+1}")
            else:
                print(f"Failed to process chunk {index+1}. Status code: {response.status_code}, Response: {response.text}")

        except Exception as e:
            print(f"Error during API request for chunk {index+1}: {str(e)}")

    # Combine WAV files if multiple chunks were processed
    if len(audio_files) > 1:
        combined_audio = AudioSegment.empty()
        for audio_file in audio_files:
            combined_audio += AudioSegment.from_wav(audio_file)

        # Save the combined audio
        combined_output_file = os.path.join(output_dir, "combined_audio.wav")
        combined_audio.export(combined_output_file, format="wav")
        print(f"Combined audio saved as {combined_output_file}")

    print("Conversion process completed.")

if __name__ == "__main__":
    # Configuration
    TRANSLATED_FILE = "translated_text.txt"
    OUTPUT_DIR = "audio_output"

    # Run conversion
    convert_text_to_speech(
        input_file=TRANSLATED_FILE,
        output_dir=OUTPUT_DIR,
        chunk_size=5000  # Adjust based on API limits
    )