import os
import argparse
import time
import shutil
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

def translate_pdf(input_pdf, output_folder):
    print(f"Starting translation for: {input_pdf}")
    
    options = Options()
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    driver = None
    try:
        driver = webdriver.Chrome(options=options)
        file_name = os.path.splitext(os.path.basename(input_pdf))[0]
        languages = {"hi": "Hindi", "mr": "Marathi"}

        for lang_code, lang_name in languages.items():
            print(f"Translating to {lang_name}...")
            driver.get(f"https://translate.google.com/?sl=en&tl={lang_code}&op=docs")
            
            # Upload file
            file_input = WebDriverWait(driver, 30).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, 'input[type="file"]'))
            )
            file_input.send_keys(input_pdf)
            
            # Start translation
            translate_button = WebDriverWait(driver, 30).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, '[jsname="vSSGHe"]'))
            )
            translate_button.click()
            
            # Download translated file
            download_button = WebDriverWait(driver, 120).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, '[jsname="hRZeKc"]'))
            )
            download_button.click()
            
            # Wait for download
            time.sleep(15)
            
            # Process downloaded file
            download_dir = os.path.join(os.path.expanduser("~"), "Downloads")
            pdf_files = [f for f in os.listdir(download_dir) if f.lower().endswith('.pdf')]
            
            if pdf_files:
                translated_pdf = max(
                    [os.path.join(download_dir, f) for f in pdf_files],
                    key=os.path.getctime
                )
                translated_base_name = os.path.splitext(os.path.basename(translated_pdf))[0]
                
                if translated_base_name.endswith("_en"):
                    translated_base_name = translated_base_name[:-3]
                
                new_filename = os.path.join(output_folder, f"{translated_base_name}_{lang_code}.pdf")
                shutil.move(translated_pdf, new_filename)
                print(f"Saved translated PDF: {new_filename}")

        print("Translation process completed successfully")
        return True

    except Exception as e:
        print(f"Translation failed: {str(e)}")
        return False
    
    finally:
        if driver:
            driver.quit()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Translate PDF file')
    parser.add_argument('--input', required=True, help='Input PDF file path')
    parser.add_argument('--output', required=True, help='Output directory path')
    args = parser.parse_args()
    
    translate_pdf(args.input, args.output)