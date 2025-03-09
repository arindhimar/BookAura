import subprocess

# Define the text and parameters
text = "तुमचे मराठी मजकूर"
speed = "125"  # Words per minute (lower = slower)
amplitude = "200"  # Volume (0-200)
output_file = "output.wav"

# Create the PowerShell script with flags
script = f'''
$text = "{text}"
& "C:\\Program Files\\eSpeak NG\\espeak-ng.exe" -v mr -s {speed} -a {amplitude} "$text" -w "{output_file}"
'''

# Save and run the script
with open("script.ps1", "w", encoding="utf-8") as f:
    f.write(script)

subprocess.call([
    "powershell.exe",
    "-ExecutionPolicy", "Bypass",
    "-File", "script.ps1"
])