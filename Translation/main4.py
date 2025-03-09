from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import os
import shutil

# File path for input PDF
input_pdf = "C:/Users/Arin Dhimar/Documents/BookAura/Translation/input.pdf"
output_folder = "C:/Users/Arin Dhimar/Documents/BookAura/Translation/"

# List of target languages (Hindi & Marathi)
languages = {"hi": "Hindi", "mr": "Marathi"}

# Initialize Chrome with options
options = webdriver.ChromeOptions()
options.add_argument("--disable-blink-features=AutomationControlled")
options.add_argument("--headless=new")
driver = webdriver.Chrome(options=options)

for lang_code, lang_name in languages.items():
    try:
        print(f"Translating to {lang_name}...")

        # Open Google Translate Docs page with the selected language
        driver.get(f"https://translate.google.com/?sl=en&tl={lang_code}&op=docs")

        # Upload the PDF file
        file_input = WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, 'input[type="file"]'))
        )
        file_input.send_keys(input_pdf)
        print(f"File uploaded for {lang_name}.")

        # Click the "Translate" button
        translate_button = WebDriverWait(driver, 20).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, '[jsname="vSSGHe"]'))
        )
        translate_button.click()
        print(f"Translation to {lang_name} started.")

        # Wait for translation to complete
        download_button = WebDriverWait(driver, 60).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, '[jsname="hRZeKc"]'))
        )
        print(f"Translation to {lang_name} completed. Downloading...")

        # Click the download button
        download_button.click()
        print(f"Download initiated for {lang_name}.")

        # Wait for the download to complete
        time.sleep(10)  # Adjust this sleep time based on network speed

        # Locate the most recent PDF in the default download folder
        download_dir = os.path.join(os.path.expanduser("~"), "Downloads")
        pdf_files = [os.path.join(download_dir, f) for f in os.listdir(download_dir) if f.endswith(".pdf")]
        if not pdf_files:
            raise Exception("No PDF found in the Downloads folder.")

        translated_pdf = max(pdf_files, key=os.path.getctime)

        # Build new file name: keep original file name + language tag + unique timestamp
        base_name = os.path.splitext(os.path.basename(input_pdf))[0]
        unique_tag = int(time.time())
        new_filename = os.path.join(output_folder, f"{base_name}_{lang_name}_{unique_tag}.pdf")

        shutil.move(translated_pdf, new_filename)
        print(f"Saved translated PDF as: {new_filename}")

    except Exception as e:
        print(f"Error translating to {lang_name}: {e}")

# Close the browser
driver.quit()
print("Translation process completed.")
