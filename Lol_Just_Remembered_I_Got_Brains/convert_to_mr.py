import requests
import json

# API endpoint and payload
url = 'https://admin.models.ai4bharat.org/inference/translate'
payload = {
    "sourceLanguage": "en",
    "targetLanguage": "mr",
    "input": "Bali is predominantly a Hindu country. Bali is known for its elaborate, traditional dancing. The dancing is inspired by its Hindi beliefs. Most of the dancing portrays tales of good versus evil. To watch the dancing is a breathtaking experience. Lombok has some impressive points of interest – the majestic Gunung Rinjani is an active volcano. It is the second highest peak in Indonesia. Art is a Balinese passion. Batik paintings and carved statues make popular souvenirs. Artists can be seen whittling and painting on the streets, particularly in Ubud. It is easy to appreciate each island as an attractive tourist destination. Majestic scenery; rich culture; white sands and warm, azure waters draw visitors like magnets every year. Snorkelling and diving around the nearby Gili Islands is magnificent. Marine fish, starfish, turtles and coral reef are present in abundance. Bali and Lombok are part of the Indonesian archipelago. Bali has some spectacular temples. The most significant is the Mother Temple, Besakih. The inhabitants of Lombok are mostly Muslim with a Hindu minority. Lombok remains the most understated of the two islands. Lombok has several temples worthy of a visit, though they are less prolific. Bali and Lombok are neighbouring islands.",
    "task": "translation",
    "serviceId": "ai4bharat/indictrans--gpu-t4",
    "track": True
}

# Headers for the request
headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

# Output file to save the translated text
output_file = "translated_text.txt"

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
    
    # Extract the translated text
    if "output" in response_data and len(response_data["output"]) > 0:
        translated_text = response_data["output"][0]["target"]
        
        # Save the translated text to a file
        with open(output_file, "w", encoding="utf-8") as file:
            file.write(translated_text)
        
        print(f"Translated text saved to {output_file}")
    else:
        print("Error: No translation found in the response.")

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