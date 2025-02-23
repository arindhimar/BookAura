from flask import request, jsonify, Blueprint
from models.book_view import BooksViewsModel
from utils.auth_utils import decode_token

app = Blueprint('books_views', __name__)
books_views_model = BooksViewsModel()

@app.route('/', methods=['GET'])
def BooksViewsModel():
    rows = books_views_model.fetch_all_books_views()
    books = [{'book_id': row[0], 'views': row[1]} for row in rows]
    return jsonify(books)

@app.route('/<int:book_id>', methods=['GET'])
def get_book_views(book_id):
    row = books_views_model.fetch_book_views_by_id(book_id)
    if row is None:
        return jsonify({'error': 'Book views not found'}), 404
    return jsonify({'book_id': row[0], 'views': row[1]})

@app.route('/<int:book_id>', methods=['POST'])
def add_view(book_id):
    books_views_model.add_view(book_id)
    return jsonify({'message': 'View added successfully'}), 201

@app.route('/<int:book_id>/add-view', methods=['PUT'])
def update_view(book_id):
    token = request.headers['Authorization']
    decoded = decode_token(token)
    if not decoded:
        return jsonify({'error': 'Invalid or expired token'}), 401
    
    books_views_model.add_view(book_id)
    return jsonify({'message': 'View updated successfully'}), 200

@app.route('/<int:book_id>', methods=['DELETE'])
def delete_view(book_id):
    books_views_model.delete_view(book_id)
    return jsonify({'message': 'View deleted successfully'}), 200