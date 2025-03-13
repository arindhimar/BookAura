from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
import os
from fastapi.responses import FileResponse
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

class TTSRequest(BaseModel):
    text: str  # English text input

@app.post("/english-tts")
async def convert_to_speech(request: TTSRequest):
    """
    Convert English text to speech using Bhashini API
    Returns audio file in MP3 format
    """
    api_url = "https://api.bhashini.gov.in/tts"
    
    headers = {
        "Authorization": f"Bearer {os.getenv('BHASHINI_API_KEY')}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "sourceLanguage": "en",  # English language code
        "text": request.text,
        "gender": "female"       # Can change to 'male' if available
    }

    try:
        # Make the API request
        response = requests.post(api_url, headers=headers, json=payload, timeout=10)
        response.raise_for_status()  # Raise HTTP errors
        
        # Save temporary audio file
        with open("output.mp3", "wb") as f:
            f.write(response.content)
            
        return FileResponse(
            "output.mp3",
            media_type="audio/mpeg",
            filename="english_speech.mp3"
        )
        
    except requests.exceptions.ConnectionError:
        raise HTTPException(
            status_code=500,
            detail="Failed to connect to Bhashini API. Check your internet connection."
        )
    except requests.exceptions.HTTPError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Bhashini API error: {e.response.text}"
        )
    except requests.exceptions.Timeout:
        raise HTTPException(
            status_code=500,
            detail="Request to Bhashini API timed out."
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)