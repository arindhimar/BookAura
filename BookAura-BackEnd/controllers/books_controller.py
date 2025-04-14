from flask import request, jsonify, Blueprint, send_from_directory
from models.books import BooksModel
import os
import time
from werkzeug.utils import secure_filename
from utils.auth_utils import decode_token
import subprocess
import json
import pdfplumber

app = Blueprint('books', __name__)
books_model = BooksModel()

UPLOAD_FOLDER = 'uploads/'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

AUDIO_UPLOAD_FOLDER = 'audio_uploads/'
os.makedirs(AUDIO_UPLOAD_FOLDER, exist_ok=True)

def upload_cover_file(file, title):
    try:
        if not file or not title:
            return None

        clean_title = secure_filename(title).replace(' ', '_')[:50]
        timestamp = int(time.time())
        filename = secure_filename(file.filename)
        ext = os.path.splitext(filename)[1].lower()
        
        # Validate image format
        allowed_extensions = {'.png', '.jpg', '.jpeg', '.gif'}
        if ext not in allowed_extensions:
            return None

        # Create dedicated cover directory
        cover_dir = os.path.join(UPLOAD_FOLDER, 'covers')
        os.makedirs(cover_dir, exist_ok=True)
        
        # Generate filename and save
        cover_filename = f"{clean_title}_cover_{timestamp}{ext}"
        cover_path = os.path.join(cover_dir, cover_filename)
        file.save(cover_path)
        
        return f"/uploads/covers/{cover_filename}"

    except Exception as error:
        print(f"Cover upload error: {str(error)}")
        return None

def upload_file(file, title):
    try:
        if not file or not title:
            return None, None

        clean_title = secure_filename(title).replace(' ', '_')[:50]
        timestamp = int(time.time())
        filename, ext = os.path.splitext(secure_filename(file.filename))
        
        # Generate both filenames
        pdf_filename = f"{clean_title}_{timestamp}_en{ext}"
        audio_filename = f"{clean_title}_{timestamp}_en.mp3"
        
        pdf_path = os.path.join(UPLOAD_FOLDER, pdf_filename)
        audio_path = os.path.join(AUDIO_UPLOAD_FOLDER, audio_filename)
        
        # Save PDF file
        file.save(pdf_path)
        
        # Trigger translation and audio conversion synchronously
        try:
            trigger_translation(pdf_path)
        except Exception as trans_error:
            print(f"Translation error: {str(trans_error)}")
            
        try:
            trigger_audio_conversion(pdf_path, audio_filename)
        except Exception as audio_error:  
            print(f"Audio conversion error: {str(audio_error)}")

        return pdf_path, audio_path

    except Exception as error:
        print(f"File upload error: {str(error)}")
        return None, None

# URLs and model IDs for translation and TTS
TRANSLATE_URL = "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/compute"
MARATHI_TRANSLATE_MODEL_ID = "641d1d7c8ecee6735a1b37c3"  # English → Marathi
HINDI_TRANSLATE_MODEL_ID = "641d1d6592a6a31751ff1f49"   # English → Hindi
MARATHI_TTS_MODEL_ID = "633c02befd966563f61bc2be"  # Marathi TTS
HINDI_TTS_MODEL_ID = "633c02befd966563f61bc2be"  # Hindi TTS

TRANSLATE_CHUNK_SIZE = 200000
TTS_CHUNK_SIZE = 25000

def trigger_audio_conversion(file_path, audio_filename=None):
    """
    Handle audio conversion in background process for English, Marathi, and Hindi.

    You can optionally pass `audio_filename` (e.g. "mybook_en.mp3") for the English output;
    otherwise it defaults to "<pdf‑basename>_en.mp3". Marathi and Hindi filenames
    are generated alongside it.
    """
    import os, subprocess
    import json  # Ensure json is imported for JSONDecodeError

    # Determine default English audio filename if not provided
    if audio_filename is None:
        base = os.path.splitext(os.path.basename(file_path))[0]
        audio_filename = f"{base}_en.mp3"

    abs_file_path = os.path.abspath(file_path)
    output_folder = os.path.abspath(AUDIO_UPLOAD_FOLDER)

    # Embed your existing script unchanged, but with updated translate_text
    script = """
import os
import pdfplumber
import pyttsx3
import re
import requests
import base64
from pydub import AudioSegment
import json  # Ensure json is imported inside the script too

TRANSLATE_URL = "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/compute"
MARATHI_TRANSLATE_MODEL_ID = "641d1d7c8ecee6735a1b37c3"  # English → Marathi
HINDI_TRANSLATE_MODEL_ID = "641d1d6592a6a31751ff1f49"   # English → Hindi
MARATHI_TTS_MODEL_ID = "633c02befd966563f61bc2be"  # Marathi TTS
HINDI_TTS_MODEL_ID = "633c02befd966563f61bc2be"  # Hindi TTS

TRANSLATE_CHUNK_SIZE = 200000
TTS_CHUNK_SIZE = 25000

def process_audio():
    input_pdf = r"{input_pdf}"
    output_folder = r"{output_folder}"

    try:
        # Correctly handle potential _en suffix if already present from upload_file
        base_name_with_ext = os.path.basename(input_pdf)
        base_name_no_ext = os.path.splitext(base_name_with_ext)[0]
        if base_name_no_ext.endswith('_en'):
             base_name_no_ext = base_name_no_ext[:-3]  # Remove _en if present

        audio_filename_en = f"{{base_name_no_ext}}_en.mp3"
        audio_filename_mr = f"{{base_name_no_ext}}_mr.mp3"
        audio_filename_hi = f"{{base_name_no_ext}}_hi.mp3"
        output_path_en = os.path.join(output_folder, audio_filename_en)
        output_path_mr = os.path.join(output_folder, audio_filename_mr)
        output_path_hi = os.path.join(output_folder, audio_filename_hi)

        text = ""
        with pdfplumber.open(input_pdf) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:  # Check if text extraction returned something
                    text += page_text + "\\n"

        if not text:
             print(f"No text could be extracted from {{input_pdf}}")
             return  # Exit if no text extracted

        text = re.sub(r"([.,!?])", r"\\1 ", text)
        text = re.sub(r"\\n+", ". \\n", text)

        # Convert English text to speech
        try:
            engine = pyttsx3.init()
            engine.setProperty('rate', 150)
            engine.save_to_file(text, output_path_en)
            engine.runAndWait()
            print(f"English audio saved to: {{output_path_en}}")
        except Exception as e:
            print(f"English TTS failed: {{str(e)}}")

        # Translate and convert to Marathi
        translated_text_mr = translate_text(text, target_lang="mr")
        if translated_text_mr:
            print("Translation to Marathi successful. Starting TTS...")
            audio_files_mr = convert_text_to_speech(translated_text_mr, output_folder, "mr")
            if audio_files_mr:
                combined_mr = AudioSegment.empty()
                for f in audio_files_mr:
                    if os.path.exists(f):
                        try:
                            combined_mr += AudioSegment.from_wav(f)
                        except Exception as seg_err:
                             print(f"Error loading Marathi segment {{f}}: {{seg_err}}")
                    else:
                        print(f"Skipping missing Marathi file: {{f}}")
                if len(combined_mr) > 0:
                    combined_mr.export(output_path_mr, format="mp3")
                    print(f"Marathi audio saved to: {{output_path_mr}}")
                else:
                     print("Marathi combined audio is empty, skipping export.")

                for f in audio_files_mr:
                    if os.path.exists(f):
                        try:
                            os.remove(f)
                        except OSError as rm_err:
                            print(f"Error removing temp Marathi file {{f}}: {{rm_err}}")
            else:
                print("No Marathi audio files were generated.")
        else:
            print("Translation to Marathi failed.")

        # Translate and convert to Hindi
        translated_text_hi = translate_text(text, target_lang="hi")
        if translated_text_hi:
            print("Translation to Hindi successful. Starting TTS...")
            audio_files_hi = convert_text_to_speech(translated_text_hi, output_folder, "hi")
            if audio_files_hi:
                combined_hi = AudioSegment.empty()
                for f in audio_files_hi:
                    if os.path.exists(f):
                        try:
                            combined_hi += AudioSegment.from_wav(f)
                        except Exception as seg_err:
                             print(f"Error loading Hindi segment {{f}}: {{seg_err}}")
                    else:
                        print(f"Skipping missing Hindi file: {{f}}")

                if len(combined_hi) > 0:
                    combined_hi.export(output_path_hi, format="mp3")
                    print(f"Hindi audio saved to: {{output_path_hi}}")
                else:
                    print("Hindi combined audio is empty, skipping export.")

                for f in audio_files_hi:
                    if os.path.exists(f):
                        try:
                            os.remove(f)
                        except OSError as rm_err:
                            print(f"Error removing temp Hindi file {{f}}: {{rm_err}}")
            else:
                print("No Hindi audio files were generated.")
        else:
            print("Translation to Hindi failed.")
    except Exception as e:
        import traceback
        print(f"Audio processing failed: {{str(e)}}")
        print(traceback.format_exc())  # Print full traceback for debugging

def translate_text(text, target_lang="mr"):
    payload = {{
        "sourceLanguage": "en",
        "targetLanguage": target_lang,
        "input": text,
        "task": "translation",
        "modelId": MARATHI_TRANSLATE_MODEL_ID if target_lang == "mr" else HINDI_TRANSLATE_MODEL_ID,
        "track": True
    }}
    headers = {{
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) BookAuraBackend/1.0'  # Added app identifier
    }}

    response = None  # Initialize response to None
    try:
        response = requests.post(TRANSLATE_URL, json=payload, headers=headers, timeout=120)  # Increased timeout
        response.raise_for_status()  # Raise an exception for bad status codes (4xx or 5xx)
        # Check if response JSON and expected keys exist
        response_json = response.json()
        if "output" in response_json and isinstance(response_json["output"], list) and len(response_json["output"]) > 0 and "target" in response_json["output"][0]:
             return response_json["output"][0]["target"]
        else:
             print(f"Unexpected JSON structure received for {{target_lang}} translation.")
             print(f"Response JSON: {{response_json}}")
             return None
    except requests.exceptions.Timeout:
        print(f"Translation API request timed out for {{target_lang}}.")
        return None
    except requests.exceptions.RequestException as e:  # Catch specific request errors
        print(f"Translation API request failed for {{target_lang}}: {{str(e)}}")
        # Log response details if available
        if response is not None:
            print(f"Response Status Code: {{response.status_code}}")
            print(f"Response Text: {{response.text}}")
        return None
    except json.JSONDecodeError as e:  # Catch JSON decoding errors specifically
        print(f"Failed to decode JSON response for {{target_lang}}: {{str(e)}}")
        if response is not None:
            print(f"Response Status Code: {{response.status_code}}")
            print(f"Response Text: {{response.text}}")  # Log the raw text that failed to parse
        return None
    except Exception as e:
        import traceback
        print(f"Generic translation error for {{target_lang}}: {{str(e)}}")
        print(traceback.format_exc())  # Print full traceback for debugging
        if response is not None:  # Log response even on generic errors if available
            print(f"Response Status Code: {{response.status_code}}")
            print(f"Response Text: {{response.text}}")
        return None

def convert_text_to_speech(text, output_folder, language):
    try:
        chunks = split_text_into_chunks(text, chunk_size=TTS_CHUNK_SIZE)  # Adjusted chunk size
        audio_files = []

        for idx, chunk in enumerate(chunks):
            print(f"Processing {{language}} chunk {{idx + 1}}/{{len(chunks)}}")

            cleaned_chunk = re.sub(r"[©®™]", "", chunk)
            if cleaned_chunk != chunk:
                print(f"Removed unsupported special characters from chunk {{idx + 1}}")

            # Ensure chunk is not empty after cleaning
            if not cleaned_chunk.strip():
                print(f"Skipping empty {{language}} chunk {{idx + 1}}")
                continue

            model_id = MARATHI_TTS_MODEL_ID if language == "mr" else HINDI_TTS_MODEL_ID
            payload = {{
                "modelId": model_id,
                "task": "tts",
                "input": [{{"source": cleaned_chunk}}],
                "gender": "female",
                "userId": None
            }}

            response = None  # Initialize response
            try:
                response = requests.post(
                    "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/compute",  # New TTS API URL
                    json=payload,
                    headers={{"Content-Type": "application/json"}} ,
                    timeout=60  # Timeout for TTS API
                )
                response.raise_for_status()  # Check for HTTP errors

                if response.status_code == 200:
                    response_json = response.json()
                    audio_content_list = response_json.get("audio")
                    if audio_content_list and isinstance(audio_content_list, list) and len(audio_content_list) > 0:
                        audio_content = audio_content_list[0].get("audioContent")
                        if audio_content:
                            chunk_file = os.path.join(output_folder, f"temp_{{language}}_chunk_{{idx + 1}}.wav")
                            try:
                                with open(chunk_file, "wb") as f:
                                    f.write(base64.b64decode(audio_content))
                                audio_files.append(chunk_file)
                                print(f"Saved {{language}} audio chunk {{idx + 1}}")
                            except (base64.binascii.Error, IOError) as write_err:
                                print(f"Error writing TTS chunk for {{language}}: {{write_err}}")
                        else:
                            print(f"Audio content missing in TTS response for chunk {{idx + 1}}")
                    else:
                        print(f"Empty or malformed audio content list for chunk {{idx + 1}}")
                else:
                    print(f"TTS API error for chunk {{idx + 1}}: {{response.status_code}}")
            except requests.exceptions.RequestException as e:
                print(f"TTS API error for chunk {{idx + 1}}: {{str(e)}}")

        return audio_files
    except Exception as e:
        print(f"Error in text-to-speech conversion: {{str(e)}}")
        return None

def split_text_into_chunks(text, chunk_size):
    return [text[i:i + chunk_size] for i in range(0, len(text), chunk_size)]

process_audio()  # Call this function to start processing
"""

    try:
        # Execute the script using subprocess.Popen
        result = subprocess.Popen(["python", "-c", script], cwd=os.path.dirname(__file__), stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        out, err = result.communicate()  # Ensure to get both stdout and stderr

        print("Script Output:", out.decode())  # Prints script's stdout to terminal
        if err:
            print("Script Error:", err.decode())  # Prints script's stderr to terminal if available

    except Exception as e:
        print(f"Failed to trigger audio conversion: {str(e)}")

def trigger_translation(file_path):
    try:
        abs_file_path = os.path.abspath(file_path)
        file_name = os.path.splitext(os.path.basename(abs_file_path))[0]
        safe_input_pdf = abs_file_path.replace("\\", "\\\\")
        output_folder = os.path.abspath(UPLOAD_FOLDER)
        
        script = f'''
import os
import time
import shutil
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

input_pdf = r"{safe_input_pdf}"
output_folder = r"{output_folder}"
file_name = "{file_name}"

languages = {{"hi": "Hindi", "mr": "Marathi"}}

options = webdriver.ChromeOptions()
options.add_argument("--disable-blink-features=AutomationControlled")
driver = webdriver.Chrome(options=options)

for lang_code, lang_name in languages.items():
    try:
        driver.get(f"https://translate.google.com/?sl=en&tl={{lang_code}}&op=docs")
        file_input = WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, 'input[type="file"]'))
        )
        file_input.send_keys(input_pdf)
        translate_button = WebDriverWait(driver, 20).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, '[jsname="vSSGHe"]'))
        )
        translate_button.click()
        download_button = WebDriverWait(driver, 60).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, '[jsname="hRZeKc"]'))
        )
        download_button.click()
        time.sleep(10)
        download_dir = os.path.join(os.path.expanduser("~"), "Downloads") + os.sep
        files = os.listdir(download_dir)
        pdf_files = [f for f in files if f.lower().endswith('.pdf')]
        if pdf_files:
            translated_pdf = max([os.path.join(download_dir, f) for f in pdf_files], key=os.path.getctime)
            translated_base_name = os.path.splitext(os.path.basename(translated_pdf))[0]
            
            if translated_base_name.endswith("_en"):
                translated_base_name = translated_base_name[:-3]

            new_filename = os.path.join(output_folder, f"{{translated_base_name}}_{{lang_code}}.pdf")
            shutil.move(translated_pdf, new_filename)
    except Exception as e:
        print(f"Error translating to {{lang_name}}: " + str(e))
driver.quit()
'''
        subprocess.Popen(['python', '-c', script])
    except Exception as e:
        print(f"Translation trigger error: {str(e)}")

@app.route('/uploads/covers/<filename>')
def serve_cover(filename):
    return send_from_directory(os.path.join(UPLOAD_FOLDER, 'covers'), filename)

@app.route('/uploads/<path:filename>')
def serve_uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/audio_uploads/<path:filename>')
def serve_audio_file(filename):
    return send_from_directory(AUDIO_UPLOAD_FOLDER, filename)


@app.route('/', methods=['GET'])
def get_all_books():
    base_url = request.host_url
    rows = books_model.get_all_books()
    books = [{
        'book_id': row['book_id'],
        'author_id': row['author_id'],
        'author_name': row['author_name'],
        'title': row['title'],
        'description': row['description'],
        'file_url': row['fileUrl'],
        'audio_url': row['audioUrl'],
        'is_public': row['is_public'],
        'is_approved': row['is_approved'],
        'uploaded_at': row['uploaded_at'],
        'uploaded_by_role': row['uploaded_by_role'],
        'cover_url': f"{row['coverUrl']}" if row['coverUrl'] else None,
        'categories': row['categories'].split(', ') if row['categories'] else [],
        'views': row['views']
    } for row in rows]
    return jsonify(books)

@app.route('/<int:book_id>', methods=['GET'])
def get_book(book_id):
    row = books_model.get_book_by_id(book_id)
    if row is None:
        return jsonify({'error': 'Book not found'}), 404

    book = {
        'book_id': row['book_id'],
        'author_id': row['author_id'],
        'author_name': row['author_name'],
        'title': row['title'],
        'description': row['description'],
        'file_url': row['fileUrl'],
        'audio_url': row['audioUrl'],
        'is_public': row['is_public'],
        'is_approved': row['is_approved'],
        'uploaded_at': row['uploaded_at'],
        'uploaded_by_role': row['uploaded_by_role'],
        'views': row['views'],
        'cover_url': f"{row['coverUrl']}" if row['coverUrl'] else None,
        'categories': row['categories'].split(', ') if row['categories'] else []
    }
    return jsonify(book)

@app.route('/', methods=['POST'])
def create_book():
    try:
        # Validate file upload
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400

        file = request.files['file']
        if not file or file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        # Validate file type for the main PDF file
        if not file.filename.lower().endswith('.pdf'):
            return jsonify({'error': 'Only PDF files are allowed'}), 400

        # Get form data
        try:
            data = request.form
            required_fields = ['title', 'description', 'is_public', 'uploaded_by_role']
            if any(field not in data for field in required_fields):
                return jsonify({'error': 'Missing required fields'}), 400
        except Exception as form_error:
            print(f"Form data error: {str(form_error)}")
            return jsonify({'error': 'Invalid form data'}), 400

        # Handle authentication
        try:
            token = request.headers.get('Authorization')
            if not token:
                return jsonify({'error': 'Authorization token is required'}), 401
            
            decoded_token = decode_token(token)
            if not decoded_token or 'user_id' not in decoded_token:
                return jsonify({'error': 'Invalid token'}), 401
        except Exception as auth_error:
            print(f"Authentication error: {str(auth_error)}")
            return jsonify({'error': 'Authentication failed'}), 401

        # Process file uploads
        try:
            timestamp = int(time.time())
            file_url, audio_url = upload_file(file, f"{data['title']}_{timestamp}")
            if not file_url:
                return jsonify({'error': 'File upload failed'}), 500
            
            cover_file = request.files.get('cover')
            # Use the dedicated cover upload function to return a string URL
            cover_url = upload_cover_file(cover_file, data['title']) if cover_file else "/default-cover.png"
        except Exception as upload_error:
            print(f"Upload processing error: {str(upload_error)}")
            return jsonify({'error': 'File processing failed'}), 500

        # Process categories
        try:
            category_ids = json.loads(data.get('category_ids', '[]'))
            if not isinstance(category_ids, list):
                return jsonify({'error': 'Invalid category format'}), 400
        except json.JSONDecodeError as json_error:
            print(f"JSON decode error: {str(json_error)}")
            return jsonify({'error': 'Invalid category data'}), 400

        # Create book record
        try:
            book_id = books_model.create_book(
                user_id=int(decoded_token['user_id']),
                title=data['title'],
                description=data['description'],
                file_url=file_url,
                audio_url=audio_url,
                is_public=data['is_public'].lower() == 'true',
                is_approved=False,
                uploaded_by_role=data['uploaded_by_role'],
                category_ids=category_ids,
                cover_url=cover_url
            )
        except Exception as db_error:
            print(f"Database error: {str(db_error)}")
            return jsonify({'error': 'Failed to create book record'}), 500

        return jsonify({
            'message': 'Book created successfully',
            'book_id': book_id,
            'file_url': file_url,
            'cover_url': cover_url,
            'audio_url': audio_url
        }), 201

    except Exception as unexpected_error:
        print(f"Unexpected error in create_book: {str(unexpected_error)}")
        return jsonify({'error': 'Internal server error'}), 500
    

@app.route('/<int:book_id>', methods=['PUT'])
def update_book(book_id):
    data = request.get_json()
    if books_model.get_book_by_id(book_id) is None:
        return jsonify({'error': 'Book not found'}), 404
    books_model.update_book(
        book_id,
        data['title'],
        data['description'],
        data['content'],
        data['is_public'],
        data['is_approved']
    )
    return jsonify({'message': 'Book updated successfully'})

@app.route('/<int:book_id>', methods=['DELETE'])
def delete_book(book_id):
    try:
        # Get fresh model instance to ensure clean connection
        books_model = BooksModel()
        
        # Check if book exists first
        if not books_model.get_book_by_id(book_id):
            return jsonify({'error': 'Book not found'}), 404

        # Perform deletion
        if books_model.delete_book(book_id):
            return jsonify({'message': 'Book deleted successfully'}), 200
        return jsonify({'error': 'Deletion failed'}), 500

    except Exception as e:
        logger.error(f"Delete book error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 5004
    

@app.route('/unread/user', methods=['GET'])
def get_unread_books_by_user():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Authorization token is required'}), 401
    decoded_token = decode_token(token)
    if not decoded_token:
        return jsonify({'error': 'Invalid token'}), 401
    user_id = decoded_token['user_id']
    unread_books = books_model.fetch_unread_books_by_user(user_id)
    books = [{
        'book_id': row[0],
        'author_id': row[1],
        'title': row[2],
        'description': row[3],
        'uploaded_by_role': row[8]
    } for row in unread_books]
    return jsonify(books)

@app.route('/unread/category', methods=['GET'])
def get_unread_books_by_category():
    categories = request.args.get('categories')
    if not categories:
        return jsonify({'error': 'Categories are required'}), 400
    category_list = categories.split(',')
    unread_books = books_model.fetch_unread_books_by_category(category_list)
    books = [{
        'book_id': row[0],
        'author_id': row[1],
        'title': row[2],
        'description': row[3],
        'uploaded_by_role': row[8]
    } for row in unread_books]
    return jsonify(books)

@app.route('/related', methods=['GET'])
def get_unread_books_by_user_and_category():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Authorization token is required'}), 401
    decoded_token = decode_token(token)
    if not decoded_token:
        return jsonify({'error': 'Invalid token'}), 401
    user_id = decoded_token['user_id']
    categories = request.args.get('categories')
    if not categories:
        return jsonify({'error': 'Categories are required'}), 400
    category_list = categories.split(',')
    unread_books = books_model.fetch_unread_books_by_user_and_category(user_id, category_list)
    return jsonify(unread_books)

@app.route('/<filename>')
def get_pdf(filename):
    language = request.args.get('language', default='english')
    
    if language == 'english':
        return send_from_directory(UPLOAD_FOLDER, filename)
    elif language == 'hindi':
        return send_from_directory(UPLOAD_FOLDER, filename.replace('_en', '_hi'))
    elif language == 'marathi':
        return send_from_directory(UPLOAD_FOLDER, filename.replace('_en', '_mr'))
    
    return jsonify({'error': 'Invalid language'}), 400

@app.route('/audio/<filename>')
def get_audio(filename):
    language = request.args.get('language', default='english')
    if language == 'english':
        return send_from_directory(AUDIO_UPLOAD_FOLDER, filename)
    elif language == 'hindi':
        return send_from_directory(AUDIO_UPLOAD_FOLDER, filename.replace('_en', '_hi'))
    elif language == 'marathi':
        return send_from_directory(AUDIO_UPLOAD_FOLDER, filename.replace('_en', '_mr'))
    return jsonify({'error': 'Invalid language'}), 400

@app.route('/unread', methods=['GET'])
def get_unread_books():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Authorization token is required'}), 401
    decoded_token = decode_token(token)
    if not decoded_token:
        return jsonify({'error': 'Invalid token'}), 401
    user_id = decoded_token['user_id']
    unread_books = books_model.fetch_unread_books(user_id)
    books = [{
        'book_id': row[0],
        'author_id': row[1],
        'title': row[2],
        'description': row[3],
        'uploaded_by_role': row[8]
    } for row in unread_books]
    return jsonify(books)

@app.route('/<int:book_id>/author', methods=['GET'])
def get_book_author(book_id):
    author = books_model.fetch_book_author(book_id)
    if author is None:
        return jsonify({'error': 'Author not found'}), 404
    return jsonify({'author_name': author})

@app.route('/search/<string:query>', methods=['GET'])
def search_books(query):
    rows = books_model.search_books(query)
    books = [{
        'book_id': row['book_id'],
        'author_id': row['author_id'],
        'author_name': row['author_name'],
        'title': row['title'],
        'description': row['description'],
        'file_url': row['fileUrl'],
        'audio_url': row['audioUrl'],
        'is_public': row['is_public'],
        'is_approved': row['is_approved'],
        'uploaded_at': row['uploaded_at'],
        'uploaded_by_role': row['uploaded_by_role'],
        'categories': row['categories'].split(', ') if row['categories'] else [],
        'views': row['views']
    } for row in rows]
    return jsonify(books)

@app.route('/category/<int:category_id>', methods=['GET'])
def get_books_by_category(category_id):
    rows = books_model.fetch_books_by_category(category_id)
    books = [{
        'book_id': row['book_id'],
        'author_id': row['author_id'],
        'author_name': row['author_name'],
        'title': row['title'],
        'description': row['description'],
        'file_url': row['fileUrl'],
        'audio_url': row['audioUrl'],
        'is_public': row['is_public'],
        'is_approved': row['is_approved'],
        'uploaded_at': row['uploaded_at'],
        'uploaded_by_role': row['uploaded_by_role'],
        'categories': row['categories'].split(', ') if row['categories'] else [],
        'views': row['views']
    } for row in rows]
    return jsonify(books)

@app.route('/full/<int:book_id>', methods=['GET'])
def get_full_book(book_id):
    book_data = books_model.fetch_complete_book(book_id)
    if not book_data:
        return jsonify({"error": "Book not found"}), 404
    return jsonify(book_data)

@app.route('/publisher/', methods=['GET'])
def get_books_by_publisher():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Authorization token is required'}), 401
    
    user = decode_token(token)
    if not user:
        return jsonify({'error': 'Invalid token'}), 401
    
    publisher_id = user['user_id']
    rows = books_model.fetch_books_by_publisher(publisher_id)
    
    books = [{
        'book_id': row['book_id'],
        'author_id': row['author_id'],
        'author_name': row['author_name'],
        'title': row['title'],
        'description': row['description'],
        'file_url': row['fileUrl'],
        'audio_url': row['audioUrl'],
        'is_public': row['is_public'],
        'is_approved': row['is_approved'],
        'uploaded_at': row['uploaded_at'],
        'uploaded_by_role': row['uploaded_by_role'],
        'categories': row['categories'].split(', ') if row['categories'] else [],
        'views': row['views']
    } for row in rows]
    
    return jsonify(books)