import pdfplumber
import re
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

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

def translate_full_text(driver, full_text, max_retries=3):
    """Translates full text using absolute XPaths with robust waiting"""
    for attempt in range(max_retries):
        try:
            driver.get("https://ai4bharat.iitm.ac.in/areas/model/NMT/IndicTrans2")
            
            # Wait for page to fully load using absolute XPaths
            WebDriverWait(driver, 30).until(
                EC.presence_of_element_located((By.XPATH, "/html/body/div[2]/div[1]/div[2]/div/div/div/div/div[2]/div/textarea"))
            )

            # Source language dropdown (full XPath)
            source_dropdown = WebDriverWait(driver, 20).until(
                EC.element_to_be_clickable((By.XPATH, "/html/body/div[2]/div[1]/div[2]/div/div/div/div/div[1]/div[1]/div[2]/select"))
            )
            Select(source_dropdown).select_by_visible_text("English")

            # Target language dropdown (full XPath)
            target_dropdown = WebDriverWait(driver, 20).until(
                EC.element_to_be_clickable((By.XPATH, "/html/body/div[2]/div[1]/div[2]/div/div/div/div/div[1]/div[1]/div[2]/select"))
            )
            Select(target_dropdown).select_by_visible_text("Marathi")

            # Input textarea (full XPath)
            input_area = WebDriverWait(driver, 20).until(
                EC.element_to_be_clickable((By.XPATH, "/html/body/div[2]/div[1]/div[2]/div/div/div/div/div[2]/div/textarea"))
            )
            
            # JavaScript input with full event simulation
            driver.execute_script("""
                const textarea = arguments[0];
                textarea.value = arguments[1];
                textarea.dispatchEvent(new Event('input', { bubbles: true }));
                textarea.dispatchEvent(new Event('change', { bubbles: true }));
            """, input_area, full_text)

            # Translate button (full XPath)
            translate_btn = WebDriverWait(driver, 20).until(
                EC.element_to_be_clickable((By.XPATH, "/html/body/div[2]/div[1]/div[2]/div/div/div/div/div[2]/button"))
            )
            
            # Click with visual interaction
            driver.execute_script("arguments[0].scrollIntoView(true);", translate_btn)
            translate_btn.click()

            # Wait for translation output (full XPath)
            output_area = WebDriverWait(driver, 60).until(
                EC.visibility_of_element_located((By.XPATH, "/html/body/div[2]/div[1]/div[2]/div/div/div/div/div[2]/textarea"))
            )
            
            # Final content verification
            WebDriverWait(driver, 30).until(
                lambda d: output_area.get_attribute("value").strip() != ""
            )
            
            return output_area.get_attribute("value").strip()

        except TimeoutException as e:
            print(f"Attempt {attempt+1} failed: Element not found within timeout period")
            if attempt == max_retries - 1:
                print("Full XPaths used:")
                print("Source dropdown: /html/body/div[2]/div[1]/div[2]/div/div/div/div/div[1]/div[1]/div[2]/select")
                print("Target dropdown: /html/body/div[2]/div[1]/div[2]/div/div/div/div/div[1]/div[1]/div[2]/select")
            driver.save_screenshot(f"error_attempt_{attempt+1}.png")
        except Exception as e:
            print(f"Attempt {attempt+1} failed: {str(e)}")
        
        driver.refresh()
        time.sleep(5)
    
    return None
def translate_pdf(pdf_path, output_file):
    """Main translation workflow"""
    extracted_text = extract_text_from_pdf(pdf_path)
    if not extracted_text:
        return

    processed_text = preprocess_text(extracted_text)
    print(f"Text length: {len(processed_text)} characters")

    driver = webdriver.Chrome()
    try:
        start_time = time.time()
        translated_text = translate_full_text(driver, processed_text)
        
        if translated_text:
            with open(output_file, "w", encoding="utf-8") as file:
                file.write(translated_text)
            print(f"Translation saved in {time.time()-start_time:.2f} seconds")
            print(f"Translated character count: {len(translated_text)}")
        else:
            print("Translation failed")
            
    finally:
        driver.quit()
        print("Browser closed")

# Example Usage
pdf_path = "sample.pdf"  # Replace with your PDF path
output_file = "translated_text.txt"

translate_pdf(pdf_path, output_file)