import os
import time
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
from selenium.webdriver.chrome.options import Options

def convert_text_to_speech(input_file, output_dir="audio_output", chunk_size=500):
    """
    Convert text from file to audio using AI4Bharat TTS
    :param input_file: Path to translated text file
    :param output_dir: Directory to save audio files
    :param chunk_size: Maximum characters per TTS request
    """
    # Setup Chrome options
    chrome_options = Options()
    chrome_options.add_experimental_option("prefs", {
        "download.default_directory": os.path.abspath(output_dir),
        "download.prompt_for_download": False,
        "download.directory_upgrade": True,
        "safebrowsing.enabled": True
    })

    # Initialize WebDriver
    driver = webdriver.Chrome(options=chrome_options)
    driver.get("https://ai4bharat.iitm.ac.in/areas/model/TTS/IndicTTS")

    try:
        # Create output directory if needed
        os.makedirs(output_dir, exist_ok=True)

        # Configure model and language
        WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.XPATH, "/html/body/div[2]/div[1]/div[2]/div/div/div/div/div[1]/div[1]/div[1]/select"))
        )
        Select(driver.find_element(By.XPATH, "/html/body/div[2]/div[1]/div[2]/div/div/div/div/div[1]/div[1]/div[1]/select")).select_by_visible_text("ai4bharat/indic-tts-indo-aryan--gpu-t4")
        
        WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.XPATH, "/html/body/div[2]/div[1]/div[2]/div/div/div/div/div[1]/div[1]/div[2]/div/div/select"))
        )
        Select(driver.find_element(By.XPATH, "/html/body/div[2]/div[1]/div[2]/div/div/div/div/div[1]/div[1]/div[2]/div/div/select")).select_by_visible_text("Marathi")
        
        time.sleep(2)  # Allow time for model loading

        # Read translated text
        with open(input_file, "r", encoding="utf-8") as f:
            full_text = f.read()

        # Split text into chunks
        chunks = [full_text[i:i+chunk_size] for i in range(0, len(full_text), chunk_size)]

        for index, chunk in enumerate(chunks):
            print(f"Processing chunk {index+1}/{len(chunks)}")
            
            # Input text
            textarea = WebDriverWait(driver, 20).until(
                EC.element_to_be_clickable((By.XPATH, "/html/body/div[2]/div[1]/div[2]/div/div/div/div/div[2]/div/textarea"))
            )
            textarea.clear()
            textarea.send_keys(chunk)

            # Click convert button
            convert_btn = WebDriverWait(driver, 20).until(
                EC.element_to_be_clickable((By.XPATH, "/html/body/div[2]/div[1]/div[2]/div/div/div/div/div[2]/button"))
            )
            convert_btn.click()

            # Wait for audio generation
            WebDriverWait(driver, 40).until(
                EC.presence_of_element_located((By.XPATH, "//audio[contains(@src,'blob')]"))
            )

            # Open context menu
            menu_btn = WebDriverWait(driver, 20).until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(@class,'audio-menu-button')]"))
            )
            menu_btn.click()
            time.sleep(1)

            # Click download
            download_btn = WebDriverWait(driver, 20).until(
                EC.element_to_be_clickable((By.XPATH, "//div[contains(text(),'Download')]"))
            )
            download_btn.click()
            time.sleep(2)  # Allow download to start

            # Rename downloaded file
            rename_latest_file(output_dir, index+1)

    except Exception as e:
        print(f"Error during conversion: {str(e)}")
    finally:
        driver.quit()
        print("Conversion process completed.")

def rename_latest_file(output_dir, index):
    """Rename the most recently downloaded file"""
    files = [f for f in os.listdir(output_dir) if f.endswith('.mp3')]
    if files:
        # Get most recently modified file
        files.sort(key=lambda x: os.path.getmtime(os.path.join(output_dir, x)), reverse=True)
        latest_file = os.path.join(output_dir, files[0])
        new_name = os.path.join(output_dir, f"audio_{index}.mp3")
        
        # Ensure we don't overwrite existing files
        if not os.path.exists(new_name):
            os.rename(latest_file, new_name)
            print(f"Saved {new_name}")

if __name__ == "__main__":
    # Configuration
    TRANSLATED_FILE = "translated_text.txt"
    OUTPUT_DIR = "audio_output"
    
    # Run conversion
    convert_text_to_speech(
        input_file=TRANSLATED_FILE,
        output_dir=OUTPUT_DIR,
        chunk_size=500  # Adjust based on TTS limits
    )