import fitz  # PyMuPDF
from deep_translator import GoogleTranslator

# Extract text from PDF
def extract_text_from_pdf(pdf_path):
    doc = fitz.open(pdf_path)
    text = "\n".join([page.get_text("text") for page in doc])
    return text.strip()  # Remove any empty spaces

# Split text into ≤5000-character chunks
def split_text(text, max_length=5000):
    chunks = []
    while len(text) > max_length:
        split_index = text[:max_length].rfind(" ")
        if split_index == -1:
            split_index = max_length
        chunks.append(text[:split_index])
        text = text[split_index:].lstrip()
    chunks.append(text)
    return chunks

# Translate text to Marathi
def translate_text(text, dest_lang="mr"):
    if not text:
        print("⚠️ No text to translate!")
        return ""
    
    translator = GoogleTranslator(source="en", target=dest_lang)
    text_chunks = split_text(text)
    
    translated_chunks = []
    for chunk in text_chunks:
        try:
            translated_chunks.append(translator.translate(chunk))
        except Exception as e:
            print(f"⚠️ Translation error: {e}")
    
    return " ".join(translated_chunks).strip()

# File path
pdf_path = "sample.pdf"

print("📌 Extracting text from PDF...")
english_text = extract_text_from_pdf(pdf_path)

print("📌 Translating text to Marathi...")
marathi_text = translate_text(english_text)

print("\n📜 **Translated Marathi Text:**\n")
print(marathi_text)
