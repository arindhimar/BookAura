from flask import request, jsonify, Blueprint
from models.books import BooksModel
import os
from werkzeug.utils import secure_filename
from utils.auth_utils import decode_token

app = Blueprint('books', __name__)
books_model = BooksModel()

UPLOAD_FOLDER = 'uploads/'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def upload_file(file):
    """Save the uploaded file and return its path."""
    if not file:
        return None
    
    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)
    return file_path  

@app.route('/', methods=['GET'])
def get_all_books():
    rows = books_model.fetch_all_books()
    
    books = [{'book_id': row[0], 'author_id': row[1], 'title': row[2], 'description': row[3],'uploaded_by_role':row[8]} for row in rows]
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
        'categories': row[9].split(', ') if row[9] else []  # Convert string to list
    }

    return jsonify(book)


@app.route('/', methods=['POST'])
def create_book():
    print(request.files)
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
    
    print(data)    
    try:
        required_fields = ['title', 'description', 'is_public']
        for field in required_fields:
            if field not in data:
                print(f'Missing required field: {field}')
                return jsonify({'error': f'Missing required field: {field}'}), 400
    except e:
        print(f'Error: {e}')
        

        
    
    
    
    
    is_public = data['is_public'].lower() == 'true' 


    uploaded_by_role = data['uploaded_by_role']

    # Insert into the database
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
    books_model.update_book(book_id, data['title'], data['description'], data['content'], data['is_public'], data['is_approved'])
    return jsonify({'message': 'Book updated successfully'})

@app.route('/<int:book_id>', methods=['DELETE'])
def delete_book(book_id):
    if books_model.fetch_book_by_id(book_id) is None:
        return jsonify({'error': 'Book not found'}), 404
    books_model.delete_book(book_id)
    return jsonify({'message': 'Book deleted successfully'}), 200

@app.route('/recommendations', methods=['POST']) 
def get_recommendations():
    data = request.get_json()

    if 'user_id' not in data or 'categories' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
    
    user_id = data['user_id']
    categories = data['categories']  

    recommendations = books_model.get_recommendations(user_id, categories)
    return jsonify(recommendations)
