import pdfplumber
import re
import time
import threading
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from queue import Queue

NUM_BROWSERS = 3  # Adjust based on system capacity

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

def preprocess_text(text):
    """Enhances text readability for translation."""
    text = re.sub(r"([.,!?])", r"\1 ", text)  # Ensure space after punctuation
    text = re.sub(r"\n+", ". \n", text)  # Convert new lines to sentence breaks
    return text

def split_text_into_chunks(text, max_length=1000):
    """Splits text into chunks with a maximum length, ensuring sentences stay intact."""
    sentences = re.split(r'(?<=[.?!])\s+', text)  # Split by sentence
    chunks = []
    current_chunk = ""

    for sentence in sentences:
        if len(current_chunk) + len(sentence) < max_length:
            current_chunk += sentence + " "
        else:
            chunks.append(current_chunk.strip())
            current_chunk = sentence + " "

    if current_chunk:
        chunks.append(current_chunk.strip())

    return chunks

def translate_chunk(driver, chunk, retries=3):
    """Translates a single text chunk using Selenium."""
    for attempt in range(retries):
        try:
            driver.get("https://ai4bharat.iitm.ac.in/areas/model/NMT/IndicTrans2")
            time.sleep(3)

            # Select source language (English)
            source_lang_dropdown = driver.find_element(By.XPATH, "/html/body/div[2]/div[1]/div[2]/div/div/div/div/div[1]/div[1]/div[2]/select")
            Select(source_lang_dropdown).select_by_visible_text("English")
            time.sleep(1)

            # Select target language (Marathi)
            target_lang_dropdown = driver.find_element(By.XPATH, "/html/body/div[2]/div[1]/div[2]/div/div/div/div/div[1]/div[2]/div/select")
            Select(target_lang_dropdown).select_by_visible_text("Marathi")
            time.sleep(1)

            # Input text
            input_textarea = driver.find_element(By.XPATH, "/html/body/div[2]/div[1]/div[2]/div/div/div/div/div[2]/div/textarea")
            input_textarea.clear()
            input_textarea.send_keys(chunk)
            time.sleep(2)

            # Click translate
            translate_button = driver.find_element(By.XPATH, "/html/body/div[2]/div[1]/div[2]/div/div/div/div/div[2]/button")
            translate_button.click()
            time.sleep(5)

            # Get translated text
            translated_textarea = driver.find_element(By.XPATH, "/html/body/div[2]/div[1]/div[2]/div/div/div/div/div[2]/textarea")
            return translated_textarea.get_attribute("value")
        
        except Exception as e:
            print(f"Error translating chunk: {e}. Retrying ({attempt+1}/{retries})...")
            time.sleep(5)

    return "[Translation Failed]"

def translation_worker(task_queue, results, browser_index):
    """Worker function for parallel translation."""
    driver = webdriver.Chrome()  
    while not task_queue.empty():
        chunk_index, chunk = task_queue.get()
        print(f"[Browser {browser_index}] Translating chunk {chunk_index + 1}...")
        translated_text = translate_chunk(driver, chunk)
        results[chunk_index] = translated_text
        task_queue.task_done()
    driver.quit()

def parallel_translate(text_chunks, output_file):
    """Translates text chunks in parallel using multiple browser instances."""
    task_queue = Queue()
    results = {}

    # Add tasks to queue
    for index, chunk in enumerate(text_chunks):
        task_queue.put((index, chunk))

    # Create threads for multiple browsers
    threads = []
    for i in range(NUM_BROWSERS):
        thread = threading.Thread(target=translation_worker, args=(task_queue, results, i + 1))
        thread.start()
        threads.append(thread)

    # Wait for all threads to finish
    for thread in threads:
        thread.join()

    # Sort results by index and write to file
    translated_texts = [results[i] for i in sorted(results.keys())]
    with open(output_file, "w", encoding="utf-8") as file:
        file.write("\n\n".join(translated_texts))

    print(f"\nTranslation saved to {output_file}")

# Example Usage
pdf_path = "sample.pdf"  # Replace with your PDF path
output_file = "translated_text.txt"

extracted_text = extract_text_from_pdf(pdf_path)

if extracted_text:
    print("Extracted Text (Preview):\n", extracted_text[:500])  
    processed_text = preprocess_text(extracted_text)
    text_chunks = split_text_into_chunks(processed_text, max_length=1000)  
    parallel_translate(text_chunks, output_file)  
else:
    print("No text extracted or file error.")
