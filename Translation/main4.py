from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import os
import time

# Configure headless options
options = webdriver.ChromeOptions()
options.add_argument("--headless=new")  # Modern headless mode
options.add_argument("--disable-gpu")
options.add_argument("--window-size=1920,1080")
options.add_argument("--disable-blink-features=AutomationControlled")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")

# Set download directory (create if doesn't exist)
download_dir = os.path.join(os.path.expanduser("~"), "Documents", "TranslatedPDFs")
os.makedirs(download_dir, exist_ok=True)

# Configure download preferences
options.add_experimental_option("prefs", {
    "download.default_directory": download_dir,
    "download.prompt_for_download": False,
    "plugins.always_open_pdf_externally": True,
    "profile.default_content_settings.popups": 0
})

# Initialize driver with anti-detection
driver = webdriver.Chrome(options=options)
driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {
    "source": """
    Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined
    });
    """
})

try:
    driver.get("https://translate.google.com/?sl=en&tl=mr&op=docs")
    print("Loaded Google Translate document page")

    # Verify languages through UI elements
    WebDriverWait(driver, 15).until(
        EC.text_to_be_present_in_element((By.CSS_SELECTOR, ".SLOrkd"), "English")
    )
    WebDriverWait(driver, 15).until(
        EC.text_to_be_present_in_element((By.CSS_SELECTOR, ".TLOrkd"), "Marathi")
    )

    # Upload file
    file_input = WebDriverWait(driver, 20).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, 'input[type="file"]'))
    )
    file_input.send_keys("C:/Users/Arin Dhimar/Documents/BookAura/Translation/input.pdf")
    print("PDF file uploaded successfully")

    # Initiate translation
    translate_button = WebDriverWait(driver, 20).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, '[jsname="vSSGHe"]'))
    )
    driver.execute_script("arguments[0].click();", translate_button)
    print("Translation process started")

    # Wait for translation completion
    WebDriverWait(driver, 60).until(
        EC.invisibility_of_element_located((By.CSS_SELECTOR, ".Wt5Tfe"))  # Progress spinner
    )
    print("Translation completed")

    # Trigger download
    download_button = WebDriverWait(driver, 30).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, '[jsname="hRZeKc"]'))
    )
    driver.execute_script("arguments[0].click();", download_button)
    print("Download initiated")

    # Verify download completion
    time.sleep(10)  # Allow time for download
    downloaded_files = [f for f in os.listdir(download_dir) if f.endswith(".pdf")]
    if downloaded_files:
        print(f"Download successful! File saved to: {os.path.join(download_dir, downloaded_files[-1])}")
    else:
        print("Download verification failed - check download directory")

except Exception as e:
    print(f"Error occurred: {str(e)}")
    driver.save_screenshot("error_screenshot.png")
    print("Saved error screenshot to error_screenshot.png")

finally:
    driver.quit()