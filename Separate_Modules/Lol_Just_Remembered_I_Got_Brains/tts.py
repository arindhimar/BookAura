import requests
import base64

# API endpoint and payload
url = 'https://admin.models.ai4bharat.org/inference/convert'
payload = {
    "sourceLanguage": "mr",
    "input": "बाली हा प्रामुख्याने हिंदू देश आहे. बाली हे त्याच्या विस्तृत, पारंपरिक नृत्यासाठी ओळखले जाते. हे नृत्य त्याच्या हिंदी विश्वासांवर आधारित आहे. बहुतांश नृत्यामध्ये चांगल्या विरुद्ध वाईट या कथांचे चित्रण केले जाते. नृत्य पाहणे हा एक चित्तथरारक अनुभव असतो. लोंबोकमध्ये काही लक्षवेधी ठिकाणे आहेत-भव्य गुनुंग रिंजानी हा एक सक्रिय ज्वालामुखी आहे. इंडोनेशियातील हे दुसरे सर्वोच्च शिखर आहे. कला ही बालीची आवड आहे. बाटिक चित्रे आणि कोरलेल्या मूर्ती लोकप्रिय स्मृतीचिन्ह बनवतात. कलाकारांना रस्त्यावर, विशेषतः उबुदमध्ये, चित्र काढताना आणि चित्र काढताना पाहिले जाऊ शकते. एक आकर्षक पर्यटन स्थळ म्हणून प्रत्येक बेटाचे कौतुक करणे सोपे आहे. भव्य दृश्ये; समृद्ध संस्कृती; पांढरी वाळू आणि उबदार, निळसर पाणी दरवर्षी अभ्यागतांना चुंबकासारखे आकर्षित करते. जवळच्या गिली बेटांच्या भोवती स्नॉर्केलिंग आणि डायव्हिंग करणे भव्य आहे. सागरी मासे, स्टारफिश, कासव आणि प्रवाळ खडक विपुल प्रमाणात आहेत. बाली आणि लोम्बोक हे इंडोनेशियन द्वीपसमूहांचे भाग आहेत. बालीमध्ये काही नेत्रदीपक मंदिरे आहेत. बेसाकीह हे मातामंदिर सर्वात महत्त्वाचे आहे. लोम्बोकचे रहिवासी बहुसंख्य मुसलमान असून हिंदू अल्पसंख्याक आहेत. या दोन बेटांपैकी लोम्बोक हे सर्वात दुर्लक्षित बेट आहे. लोंबोकमध्ये भेट देण्याजोगी अनेक मंदिरे आहेत, जरी ती कमी समृद्ध आहेत. बाली आणि लोम्बोक ही शेजारील बेटे आहेत.",
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