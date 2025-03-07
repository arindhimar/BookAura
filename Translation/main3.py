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
        time.sleep(10)  # Adjust as needed based on network speed

        # Rename and move the downloaded file (assuming default download folder)
        download_dir = os.path.expanduser("~") + "/Downloads/"
        translated_pdf = max([download_dir + f for f in os.listdir(download_dir)], key=os.path.getctime)
        new_filename = os.path.join(output_folder, f"Translated_{lang_name}.pdf")
        shutil.move(translated_pdf, new_filename)
        print(f"Saved translated PDF: {new_filename}")

    except Exception as e:
        print(f"Error translating to {lang_name}: {e}")

# Close the browser
driver.quit()
print("Translation process completed.")
