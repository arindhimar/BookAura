from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

# Initialize Chrome with options (disable automation flags)
options = webdriver.ChromeOptions()
options.add_argument("--disable-blink-features=AutomationControlled")
driver = webdriver.Chrome(options=options)

driver.get("https://translate.google.com/?sl=en&tl=mr&op=docs")

try:
    # Upload the PDF file
    file_input = WebDriverWait(driver, 20).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, 'input[type="file"]'))
    )
    file_input.send_keys("C:/Users/Arin Dhimar/Documents/BookAura/Translation/input.pdf")
    print("File uploaded.")

    # Click the "Translate" button
    translate_button = WebDriverWait(driver, 20).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, '[jsname="vSSGHe"]'))
    )
    translate_button.click()
    print("Translation started.")

    # Wait for translation to complete (KEY FIX)
    # Wait for the download button to become fully interactive
    download_button = WebDriverWait(driver, 60).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, '[jsname="hRZeKc"]'))
    )
    print("Translation completed. Downloading...")

    # Click the download button
    download_button.click()
    print("Download initiated.")

except Exception as e:
    print("Error:", e)

# Keep the browser open for observation
time.sleep(20)
driver.quit()