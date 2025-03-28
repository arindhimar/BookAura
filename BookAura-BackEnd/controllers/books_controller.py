from flask import request, jsonify, Blueprint, send_from_directory
from models.books import BooksModel
import os
import time
from werkzeug.utils import secure_filename
from utils.auth_utils import decode_token
import subprocess
import json
import pdfplumber
import pyttsx3
import requests
from pydub import AudioSegment


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

def trigger_audio_conversion(file_path, audio_filename):
    """
    Convert the full PDF to audio for English (using pyttsx3), Hindi, and Marathi.
    This updated version saves English chunks as WAV files (since pyttsx3 outputs WAV),
    then combines them and converts the final output to MP3.
    Detailed debug logging is included.
    """
    import os
    import subprocess

    abs_file_path = os.path.abspath(file_path)
    output_folder = os.path.abspath("audio_uploads")
    # Derive base name from the provided audio_filename
    base_name = os.path.splitext(audio_filename)[0]

    script = f"""
import os
import pdfplumber
import pyttsx3
import re
import requests
import base64
from pydub import AudioSegment
import time

def process_audio():
    input_pdf = r"{abs_file_path}"
    output_folder = r"{output_folder}"
    
    try:
        # Set output filenames for each language
        audio_filename_en = "{base_name}.mp3"
        audio_filename_mr = "{base_name.replace('_en', '_mr')}.mp3"
        audio_filename_hi = "{base_name.replace('_en', '_hi')}.mp3"
        
        output_path_en = os.path.join(output_folder, audio_filename_en)
        output_path_mr = os.path.join(output_folder, audio_filename_mr)
        output_path_hi = os.path.join(output_folder, audio_filename_hi)
        
        # Extract text from PDF with debug info
        text = ""
        page_count = 0
        with pdfplumber.open(input_pdf) as pdf:
            for i, page in enumerate(pdf.pages):
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\\n"
                    print(f"Page {{i+1}}: {{len(page_text)}} characters extracted.")
                else:
                    print(f"Page {{i+1}}: No text extracted.")
                page_count += 1
        print(f"Total pages processed: {{page_count}}")
        total_length = len(text)
        print(f"Total extracted text length: {{total_length}} characters.")
        if total_length == 0:
            print("No text found in the PDF.")
            return
        
        # Preprocess text
        text = re.sub(r"([.,!?])", r"\\1 ", text)
        text = re.sub(r"\\n+", ". \\n", text).strip()
        print(f"Text length after cleaning: {{len(text)}} characters.")
        
        # --------------------
        # English Audio Conversion (using WAV temporary files)
        # --------------------
        max_chars = 5000
        chunks = []
        remaining = text
        while len(remaining) > max_chars:
            split_index = remaining.rfind(" ", 0, max_chars)
            if split_index == -1:
                split_index = max_chars
            chunk = remaining[:split_index].strip()
            chunks.append(chunk)
            remaining = remaining[split_index:].strip()
        if remaining:
            chunks.append(remaining)
        print(f"English: Split text into {{len(chunks)}} chunks.")
        for idx, ch in enumerate(chunks):
            print(f"  Chunk {{idx+1}} length: {{len(ch)}}")
        
        engine = pyttsx3.init()
        engine.setProperty('rate', 150)
        temp_files = []
        # Save as WAV files to ensure proper format.
        temp_dir = os.path.abspath(os.environ.get("TEMP", "/tmp"))
        for i, chunk in enumerate(chunks):
            temp_file = os.path.join(temp_dir, f"en_chunk_{{i}}.wav")
            print(f"Processing English chunk {{i+1}}...")
            try:
                engine.save_to_file(chunk, temp_file)
                engine.runAndWait()
                if os.path.exists(temp_file) and os.path.getsize(temp_file) > 0:
                    print(f"English chunk {{i+1}} converted successfully, file: {{temp_file}}")
                    temp_files.append(temp_file)
                else:
                    print(f"English chunk {{i+1}} conversion failed; file not created or empty.")
            except Exception as e:
                print(f"Error converting English chunk {{i+1}}: {{e}}")
        engine.stop()
        
        if not temp_files:
            print("No English audio chunks were created.")
        combined_en = AudioSegment.empty()
        for file in temp_files:
            try:
                seg = AudioSegment.from_wav(file)
                combined_en += seg
            except Exception as e:
                print(f"Error loading English chunk {{file}}: {{e}}")
        try:
            combined_en.export(output_path_en, format="mp3")
            print(f"Final English audio saved to: {{output_path_en}}")
        except Exception as e:
            print("Error exporting English audio: {{e}}")
        
        # --------------------
        # Hindi and Marathi conversion functions (unchanged)
        # --------------------
        def translate_text(text, target_lang):
            url = 'https://admin.models.ai4bharat.org/inference/translate'
            payload = {{
                "sourceLanguage": "en",
                "targetLanguage": target_lang,
                "input": text,
                "task": "translation",
                "serviceId": "ai4bharat/indictrans--gpu-t4",
                "track": True
            }}
            headers = {{
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            }}
            try:
                response = requests.post(url, json=payload, headers=headers, timeout=100)
                if response.status_code == 200:
                    translated = response.json()["output"][0]["target"]
                    print(f"Translation to {{target_lang}} successful. Translated length: {{len(translated)}} characters.")
                    return translated
                else:
                    print(f"Translation API returned status {{response.status_code}} for language {{target_lang}}")
                    return None
            except Exception as e:
                print(f"Translation to {{target_lang}} failed: {{e}}")
                return None
        
        def convert_text_to_speech(text, output_folder, language):
            max_chars_local = 5000
            chunks_local = []
            remaining_text = text
            while len(remaining_text) > max_chars_local:
                split_index = remaining_text.rfind(" ", 0, max_chars_local)
                if split_index == -1:
                    split_index = max_chars_local
                chunks_local.append(remaining_text[:split_index].strip())
                remaining_text = remaining_text[split_index:].strip()
            if remaining_text:
                chunks_local.append(remaining_text)
            print(f"{{language.upper()}}: Split translated text into {{len(chunks_local)}} chunks.")
            for idx, ch in enumerate(chunks_local):
                print(f"  {{language.upper()}} chunk {{idx+1}} length: {{len(ch)}}")
            temp_audio_files = []
            for i, chunk in enumerate(chunks_local):
                cleaned_chunk = re.sub(r"[©®™]", "", chunk)
                model_id = "633c021bfb796d5e100d4ff9" if language == "hi" else "6576a25f4e7d42484da63537"
                payload = {{
                    "modelId": model_id,
                    "task": "tts",
                    "input": [{{"source": cleaned_chunk}}],
                    "gender": "female",
                    "userId": None
                }}
                try:
                    r = requests.post(
                        "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/compute",
                        json=payload,
                        headers={{"Content-Type": "application/json"}},
                        timeout=30
                    )
                    if r.status_code == 200:
                        audio_content = r.json().get("audio", [{{}}])[0].get("audioContent")
                        if audio_content:
                            temp_file = os.path.join(output_folder, f"temp_{{language}}_chunk_{{i+1}}.wav")
                            with open(temp_file, "wb") as f:
                                f.write(base64.b64decode(audio_content))
                            temp_audio_files.append(temp_file)
                            print(f"Saved {{language.upper()}} audio chunk {{i+1}}")
                        else:
                            print(f"No audio content in {{language.upper()}} chunk {{i+1}}")
                    else:
                        print(f"TTS API returned status {{r.status_code}} for {{language.upper()}} chunk {{i+1}}")
                except Exception as e:
                    print(f"Error converting {{language.upper()}} chunk {{i+1}}: {{e}}")
                time.sleep(0.5)
            return temp_audio_files
        
        # Process Hindi
        translated_hi = translate_text(text, "hi")
        if translated_hi:
            audio_files_hi = convert_text_to_speech(translated_hi, output_folder, "hi")
            combined_hi = AudioSegment.empty()
            for file in audio_files_hi:
                try:
                    seg = AudioSegment.from_wav(file)
                    combined_hi += seg
                except Exception as e:
                    print(f"Error loading Hindi chunk {{file}}: {{e}}")
            try:
                combined_hi.export(output_path_hi, format="mp3")
                print(f"Hindi audio saved to: {{output_path_hi}}")
            except Exception as e:
                print("Error exporting Hindi audio: {{e}}")
        else:
            print("Hindi translation failed.")
        
        # Process Marathi
        translated_mr = translate_text(text, "mr")
        if translated_mr:
            audio_files_mr = convert_text_to_speech(translated_mr, output_folder, "mr")
            combined_mr = AudioSegment.empty()
            for file in audio_files_mr:
                try:
                    seg = AudioSegment.from_wav(file)
                    combined_mr += seg
                except Exception as e:
                    print(f"Error loading Marathi chunk {{file}}: {{e}}")
            try:
                combined_mr.export(output_path_mr, format="mp3")
                print(f"Marathi audio saved to: {{output_path_mr}}")
            except Exception as e:
                print("Error exporting Marathi audio: {{e}}")
        else:
            print("Marathi translation failed.")
        
    except Exception as e:
        print(f"Audio processing failed: {{e}}")

if __name__ == "__main__":
    process_audio()
"""
    # Run the script in a subprocess (non-blocking)
    subprocess.Popen(['python', '-c', script])

try:
    # Example call: trigger_audio_conversion(pdf_path, audio_filename)
    pass
except Exception as error:
    print(f"Audio conversion trigger error: {str(error)}")
        


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
    rows = books_model.fetch_all_books()
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
    row = books_model.fetch_book_by_id(book_id)
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
    if books_model.fetch_book_by_id(book_id) is None:
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
    if books_model.fetch_book_by_id(book_id) is None:
        return jsonify({'error': 'Book not found'}), 404
    books_model.delete_book(book_id)
    return jsonify({'message': 'Book deleted successfully'}), 200

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