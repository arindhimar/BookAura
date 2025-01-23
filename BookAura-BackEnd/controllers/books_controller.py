from flask import request, jsonify, Blueprint
from models.books import BooksModel

app = Blueprint('books', __name__)
books_model = BooksModel()

@app.route('/books', methods=['GET'])
def get_all_books():
    rows = books_model.fetch_all_books()
    books = [{'book_id': row[0], 'author_id': row[1], 'title': row[2], 'description': row[3]} for row in rows]
    return jsonify(books)

@app.route('/books/<int:book_id>', methods=['GET'])
def get_book(book_id):
    row = books_model.fetch_book_by_id(book_id)
    if row is None:
        return jsonify({'error': 'Book not found'}), 404
    book = {'book_id': row[0], 'author_id': row[1], 'title': row[2], 'description': row[3]}
    return jsonify(book)

@app.route('/books', methods=['POST'])
def create_book():
    data = request.get_json()
    if 'author_id' not in data or 'title' not in data or 'description' not in data or 'content' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
    books_model.create_book(data['author_id'], data['title'], data['description'], data['content'], data['is_public'], data['is_approved'])
    return jsonify({'message': 'Book created successfully'}), 201

@app.route('/books/<int:book_id>', methods=['PUT'])
def update_book(book_id):
    data = request.get_json()
    if books_model.fetch_book_by_id(book_id) is None:
        return jsonify({'error': 'Book not found'}), 404
    books_model.update_book(book_id, data['title'], data['description'], data['content'], data['is_public'], data['is_approved'])
    return jsonify({'message': 'Book updated successfully'})

@app.route('/books/<int:book_id>', methods=['DELETE'])
def delete_book(book_id):
    if books_model.fetch_book_by_id(book_id) is None:
        return jsonify({'error': 'Book not found'}), 404
    books_model.delete_book(book_id)
    return jsonify({'message': 'Book deleted successfully'}), 200
