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

def upload_file(file):
    """
    Save the uploaded file with a unique name and trigger the translation process.
    """
    if not file:
        return None

    # Rename the file with a timestamp for uniqueness.
    original_filename = secure_filename(file.filename)
    unique_filename = f"{int(time.time())}_{original_filename}"
    file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
    file.save(file_path)

    # Trigger the translation process.
    trigger_translation(file_path)
    return file_path  

def trigger_translation(file_path):
    """
    Execute a Selenium script that translates the uploaded PDF into multiple languages.
    The script uses the provided code snippet which:
      - Iterates over target languages (Hindi and Marathi).
      - Opens Google Translate Docs for each language.
      - Uploads the input PDF.
      - Clicks through to translate and download the translated PDF.
      - Waits briefly, then moves/renames the downloaded PDF to the designated output folder.
    """
    # Get the absolute path of the uploaded file.
    abs_file_path = os.path.abspath(file_path)
    # Use a raw string (via r"") to prevent escape-sequence issues.
    safe_input_pdf = abs_file_path.replace("\\", "\\\\")
    
    # Update the output folder as desired (here, using your provided absolute folder).
    output_folder = r"C:/Users/Arin Dhimar/Documents/BookAura/Translation/"
    
    # Build the multi-language Selenium script using your provided snippet.
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
            new_filename = os.path.join(output_folder, f"Translated_{{lang_name}}.pdf")
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
    file = request.files['file']
    file_url = upload_file(file)
    data = request.form  
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Authorization token is required'}), 401
    decoded_token = decode_token(token)
    if not decoded_token:
        return jsonify({'error': 'Invalid token'}), 401
    # Validate required fields.
    required_fields = ['title', 'description', 'is_public']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    is_public = data['is_public'].lower() == 'true'
    uploaded_by_role = data['uploaded_by_role']
    books_model.create_book(
        user_id=int(decoded_token['user_id']),
        title=data['title'],
        description=data['description'],
        file_url=file_url,
        is_public=is_public,
        is_approved="0",
        uploaded_by_role=uploaded_by_role,
        category_ids=data['category_ids']
    )
    return jsonify({'message': 'Book created successfully', 'file_url': file_url}), 201

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
