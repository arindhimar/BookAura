import requests
import base64

# API endpoint and payload
url = 'https://admin.models.ai4bharat.org/inference/convert'
payload = {
    "sourceLanguage": "mr",
    "input": "मराठी ही इंडो-युरोपीय भाषाकुलातील एक भाषा आहे. भारतातील प्रमुख २२ भाषांपैकी मराठी एक आहे. महाराष्ट्र आणि गोवा ह्या राज्यांची मराठी ही अधिकृत राजभाषा आहे. मराठी मातृभाषा असणार्‍या लोकसंख्येनुसार मराठी ही जगातील पंधरावी व भारतातील चौथी भाषा आहे.",
    "task": "tts",
    "serviceId": "ai4bharat/indic-tts-indo-aryan--gpu-t4",
    "samplingRate": 16000,
    "gender": "female",
    "track": True
}

# Headers for the request
headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

# Output file to save the audio
output_file = "output_audio.wav"

try:
    # Send POST request to the API
    response = requests.post(
        url,
        json=payload,
        headers=headers,
        timeout=10,
        verify=True
    )
    
    # Check for HTTP errors
    response.raise_for_status()
    
    # Parse the JSON response
    response_data = response.json()
    
    # Extract the base64-encoded audio content
    if "audio" in response_data and len(response_data["audio"]) > 0:
        audio_content = response_data["audio"][0]["audioContent"]
        
        # Decode the base64 audio content
        audio_bytes = base64.b64decode(audio_content)
        
        # Save the audio file
        with open(output_file, "wb") as file:
            file.write(audio_bytes)
        
        print(f"Audio file saved to {output_file}")
    else:
        print("Error: No audio content found in the response.")

except requests.exceptions.HTTPError as errh:
    print("HTTP Error:", errh)
except requests.exceptions.ConnectionError as errc:
    print("Connection Error:", errc)
except requests.exceptions.Timeout as errt:
    print("Timeout Error:", errt)
except requests.exceptions.RequestException as err:
    print("Request Exception:", err)
except ValueError as json_err:
    print("JSON Decoding Error:", json_err)
except KeyError as key_err:
    print("Key Error: Missing expected field in response -", key_err)
except base64.binascii.Error as base64_err:
    print("Base64 Decoding Error:", base64_err)