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

def trigger_translation(original_path):
    """Handle PDF translation and filename management"""
    abs_path = os.path.abspath(original_path)
    safe_path = abs_path.replace("\\", "\\\\")
    output_dir = r"C:/Users/Arin Dhimar/Documents/BookAura/BookAuta-BackEnd/uploads/"

    script = f'''
import os
import time
import shutil
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

input_pdf = r"{safe_path}"
output_folder = r"{output_dir}"
lang_map = {{"hi": "Hindi", "mr": "Marathi"}}

options = webdriver.ChromeOptions()
prefs = {{"download.default_directory": output_folder}}
options.add_experimental_option("prefs", prefs)
driver = webdriver.Chrome(options=options)

base_name = os.path.basename(input_pdf)
for lang_code, lang_name in lang_map.items():
    try:
        print(f"Processing {{lang_name}} translation...")
        driver.get(f"https://translate.google.com/?sl=en&tl={{lang_code}}&op=docs")
        
        # Upload document
        WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, 'input[type="file"]'))
        ).send_keys(input_pdf)
        
        # Initiate translation
        WebDriverWait(driver, 20).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, '[jsname="vSSGHe"]'))
        ).click()
        
        # Download translated version
        WebDriverWait(driver, 60).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, '[jsname="hRZeKc"]'))
        ).click()
        time.sleep(10)  # Allow download completion
        
        # Rename downloaded file
        translated_prefix = base_name.replace("_en", f"_{{lang_code}}")
        downloaded_files = [f for f in os.listdir(output_folder) 
                          if f.startswith("Translated") and f.endswith(".pdf")]
        
        if downloaded_files:
            latest_file = max(
                [os.path.join(output_folder, f) for f in downloaded_files],
                key=os.path.getctime
            )
            new_path = os.path.join(output_folder, translated_prefix)
            os.rename(latest_file, new_path)
            print(f"Renamed to: {{new_path}}")
            
    except Exception as e:
        print(f"Error processing {{lang_name}}: {{str(e)}}")

driver.quit()
print("Translation workflow complete.")
'''
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
    return send_from_directory(UPLOAD_FOLDER, filename)

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
