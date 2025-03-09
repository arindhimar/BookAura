import torch
from TTS.api import TTS
from TTS.tts.configs.xtts_config import XttsConfig

# Ensure PyTorch loads full model checkpoints
torch.serialization.add_safe_globals([XttsConfig])

# Get device
device = "cuda" if torch.cuda.is_available() else "cpu"

# List available 🐸TTS models
print(TTS().list_models())

# Initialize TTS with the correct model path
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to(device)

# Run TTS
# Ensure that "speaker_wav" is a valid path to an audio file for voice cloning
speaker_wav_path = r"C:\Users\Arin Dhimar\Documents\BookAura\CoquAi\my_voice.wav"

wav = tts.tts(text="Hello world!", speaker_wav=speaker_wav_path, language="en")

# Generate and save the speech output to a file
tts.tts_to_file(text="Hello world!", speaker_wav=speaker_wav_path, language="en", file_path="output.wav")

print("Speech synthesis completed successfully!")
