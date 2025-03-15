import pdfplumber
import requests
import json

def extract_text_from_pdf(pdf_path):
    """Extracts text from a PDF file."""
    text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                text += page.extract_text() + "\n" if page.extract_text() else ""
        return text.strip()
    except Exception as e:
        print(f"Error: {e}")
        return None

def translate_text(text, source_lang="en", target_lang="mr"):
    """Translates text using the AI4Bharat API."""
    url = 'https://admin.models.ai4bharat.org/inference/translate'
    payload = {
        "sourceLanguage": source_lang,
        "targetLanguage": target_lang,
        "input": text,
        "task": "translation",
        "serviceId": "ai4bharat/indictrans--gpu-t4",
        "track": True
    }
    headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=100, verify=True)
        response.raise_for_status()
        response_data = response.json()

        if "output" in response_data and len(response_data["output"]) > 0:
            return response_data["output"][0]["target"]
        else:
            print("Error: No translation found in the response.")
            return None
    except Exception as e:
        print(f"Error during translation: {e}")
        return None

def translate_pdf_to_marathi(pdf_path, extracted_text_file, translated_text_file):
    """Extracts text from a PDF, saves it, translates it to Marathi, and saves the translation."""
    extracted_text = extract_text_from_pdf(pdf_path)
    if not extracted_text:
        print("No text extracted or file error.")
        return

    # Save the extracted text to a file
    with open(extracted_text_file, "w", encoding="utf-8") as file:
        file.write(extracted_text)
    print(f"Extracted text saved to {extracted_text_file}")

    # Translate the extracted text
    translated_text = translate_text(extracted_text)
    if translated_text:
        with open(translated_text_file, "w", encoding="utf-8") as file:
            file.write(translated_text)
        print(f"Translated text saved to {translated_text_file}")
    else:
        print("Translation failed.")

# Example Usage
pdf_path = "sample.pdf"  # Replace with your PDF path
extracted_text_file = "extracted_text.txt"  # File to save extracted text
translated_text_file = "translated_text.txt"  # File to save translated text
translate_pdf_to_marathi(pdf_path, extracted_text_file, translated_text_file)