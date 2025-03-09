import torch
from TTS.api import TTS

# Get device
device = "cuda" if torch.cuda.is_available() else "cpu"

# Initialize TTS
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to(device)

# Generate speech using the default AI voice
wav = tts.tts(text="Hello world!", speaker="default", language="en")

# Save output to a file
tts.tts_to_file(text="Hello world!", speaker="default", language="en", file_path="output.wav")
