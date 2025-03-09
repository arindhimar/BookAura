import torch
from TTS.api import TTS

# Select device (GPU if available, otherwise CPU)
device = "cuda" if torch.cuda.is_available() else "cpu"

# Load Marathi-compatible TTS model
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to(device)

# Marathi text
marathi_text = "नमस्कार, तुम्ही कसे आहात?"

# Convert Marathi text to speech and save to file
tts.tts_to_file(text=marathi_text, language="mr", file_path="output_marathi.wav")

print("Marathi speech synthesis complete! Check 'output_marathi.wav'.")
