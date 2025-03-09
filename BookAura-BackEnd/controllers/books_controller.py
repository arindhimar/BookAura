from flask import request, jsonify, Blueprint, send_from_directory
from models.books import BooksModel
import os
import time
from werkzeug.utils import secure_filename
from utils.auth_utils import decode_token
import subprocess

app = Blueprint('books', __name__)
books_model = BooksModel()

# Folder where uploaded files are saved.
UPLOAD_FOLDER = 'uploads/'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def upload_file(file, title):
    """Save uploaded file with standardized naming convention"""
    if not file or not title:
        return None

    clean_title = secure_filename(title).replace(' ', '_')[:50]
    timestamp = int(time.time())
    filename, ext = os.path.splitext(secure_filename(file.filename))
    
    new_filename = f"{clean_title}_{timestamp}_en{ext}"
    file_path = os.path.join(UPLOAD_FOLDER, new_filename)
    
    file.save(file_path)
    trigger_translation(file_path)
    return file_path

def trigger_translation(file_path):
    """
    Execute a Selenium script that translates the uploaded PDF into multiple languages.
    The script:
      - Translates the uploaded PDF to Hindi and Marathi using Google Translate Docs.
      - Downloads the translated PDFs.
      - Renames them to match the original file name with `_hi` or `_mr` suffix.
    """
    import os
    import subprocess

    # Get the absolute path and filename of the uploaded file.
    abs_file_path = os.path.abspath(file_path)
    file_name = os.path.splitext(os.path.basename(abs_file_path))[0]  # Extract filename without extension
    # Use a raw string (via r"") to prevent escape-sequence issues.
    safe_input_pdf = abs_file_path.replace("\\", "\\\\")
    
    # Update the output folder as desired.
    output_folder = r"C:/Users/Arin Dhimar/Documents/BookAura/BookAura-BackEnd/uploads/"
    
    # Build the Selenium script.
    script = f'''
import os
import time
import shutil
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# File path for input PDF (from the Flask upload)
input_pdf = r"{safe_input_pdf}"
# Output folder where the translated PDFs will be saved.
output_folder = r"{output_folder}"
# Original file name without extension
file_name = "{file_name}"

# List of target languages (Hindi & Marathi)
languages = {{"hi": "Hindi", "mr": "Marathi"}}

# Initialize Chrome with options.
options = webdriver.ChromeOptions()
options.add_argument("--disable-blink-features=AutomationControlled")
driver = webdriver.Chrome(options=options)

for lang_code, lang_name in languages.items():
    try:
        print(f"Translating to {{lang_name}}...")
        # Open Google Translate Docs page for the target language.
        driver.get(f"https://translate.google.com/?sl=en&tl={{lang_code}}&op=docs")
        # Wait for the file input element and upload the PDF.
        file_input = WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, 'input[type="file"]'))
        )
        file_input.send_keys(input_pdf)
        print(f"File uploaded for {{lang_name}}.")
        # Click the "Translate" button.
        translate_button = WebDriverWait(driver, 20).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, '[jsname="vSSGHe"]'))
        )
        translate_button.click()
        print(f"Translation to {{lang_name}} started.")
        # Wait for translation to complete and download button to be clickable.
        download_button = WebDriverWait(driver, 60).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, '[jsname="hRZeKc"]'))
        )
        print(f"Translation to {{lang_name}} completed. Downloading...")
        download_button.click()
        print(f"Download initiated for {{lang_name}}.")
        # Wait for the download to complete.
        time.sleep(10)  # Adjust sleep time based on network speed.
        # Determine the default download directory (assuming Windows default).
        download_dir = os.path.join(os.path.expanduser("~"), "Downloads") + os.sep
        # Get a list of all PDF files in the download directory.
        files = os.listdir(download_dir)
        pdf_files = [f for f in files if f.lower().endswith('.pdf')]
        if pdf_files:
            # Get the most recently created PDF file.
            translated_pdf = max([os.path.join(download_dir, f) for f in pdf_files], key=os.path.getctime)
            translated_base_name = os.path.splitext(os.path.basename(translated_pdf))[0]
            
            # Fix naming issue (remove `_en` if present)
            if translated_base_name.endswith("_en"):
                translated_base_name = translated_base_name[:-3]  # Remove "_en"

            # Rename and move the file
            new_filename = os.path.join(output_folder, f"{{translated_base_name}}_{{lang_code}}.pdf")
            shutil.move(translated_pdf, new_filename)
            print(f"Saved translated PDF: {{new_filename}}")
        else:
            print("No PDF files found in the download directory.")
    except Exception as e:
        print(f"Error translating to {{lang_name}}: {{e}}")
driver.quit()
print("Translation process completed.")
'''
    # Launch the translation process in a separate process.
    subprocess.Popen(['python', '-c', script])

@app.route('/', methods=['GET'])
def get_all_books():
    rows = books_model.fetch_all_books()
    books = [{
        'book_id': row[0],
        'author_id': row[1],
        'title': row[2],
        'description': row[3],
        'uploaded_by_role': row[8]
    } for row in rows]
    return jsonify(books)

@app.route('/<int:book_id>', methods=['GET'])
def get_book(book_id):
    row = books_model.fetch_book_by_id(book_id)
    if row is None:
        return jsonify({'error': 'Book not found'}), 404
    book = {
        'book_id': row[0],
        'author_id': row[1],
        'title': row[2],
        'description': row[3],
        'file_url': row[4],
        'is_public': row[5],
        'is_approved': row[6],
        'uploaded_at': row[7],
        'uploaded_by_role': row[8],
        'categories': row[9].split(', ') if row[9] else []
    }
    return jsonify(book)

@app.route('/', methods=['POST'])
def create_book():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
        
    data = request.form
    file = request.files['file']
    
    # Validate required fields
    required_fields = ['title', 'description', 'is_public', 'uploaded_by_role']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400

    # Authentication
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Authorization token is required'}), 401
    decoded_token = decode_token(token)
    if not decoded_token:
        return jsonify({'error': 'Invalid token'}), 401

    # File handling with title-based naming
    file_url = upload_file(file, data['title'])
    if not file_url:
        return jsonify({'error': 'File processing failed'}), 500

    # Database operations
    try:
        books_model.create_book(
            user_id=int(decoded_token['user_id']),
            title=data['title'],
            description=data['description'],
            file_url=file_url,
            is_public=data['is_public'].lower() == 'true',
            is_approved=False,
            uploaded_by_role=data['uploaded_by_role'],
            category_ids=data.get('category_ids', '')
        )
        return jsonify({
            'message': 'Book created successfully',
            'file_url': file_url,
            'translations': [
                file_url.replace('_en', '_hi'),
                file_url.replace('_en', '_mr')
            ]
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

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
        'book_id': row[0],
        'author_id': row[1],
        'title': row[2],
        'description': row[3],
        'uploaded_by_role': row[8]
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
        'fileUrl': row['fileUrl'],
        'uploaded_by_role': row['uploaded_by_role'],
        'categories': row['categories'].split(', ') if row['categories'] else []
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
        'book_id': row[0],
        'author_id': row[1],
        'title': row[2],
        'description': row[3],
        'fileUrl': row[4],
        'is_public': row[5],
        'is_approved': row[6],
        'uploaded_at': row[7],
        'uploaded_by_role': row[8],
        'categories': row[9] 
    } for row in rows]
    
    return jsonify(books)