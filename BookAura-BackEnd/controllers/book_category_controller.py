from flask import request, jsonify, Blueprint
from models.book_category import BookCategoriesModel

app = Blueprint('book_category', __name__)
book_categories_model = BookCategoriesModel()

@app.route('/', methods=['GET'])
def get_all_book_categories():
    rows = book_categories_model.fetch_all_book_categories()
    book_categories = [{'book_category_id': row[0], 'book_id': row[1], 'category_id': row[2]} for row in rows]
    return jsonify(book_categories)

@app.route('/<int:book_category_id>', methods=['GET'])
def get_book_category(book_category_id):
    row = book_categories_model.fetch_book_category_by_id(book_category_id)
    if row is None:
        return jsonify({'error': 'Book category not found'}), 404
    book_category = {'book_category_id': row[0], 'book_id': row[1], 'category_id': row[2]}
    return jsonify(book_category)

@app.route('/', methods=['POST'])
def create_book_category():
    data = request.get_json()
    if 'book_id' not in data or 'category_id' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
    book_categories_model.create_book_category(data['book_id'], data['category_id'])
    return jsonify({'message': 'Book category created successfully'}), 201

@app.route('/<int:book_category_id>', methods=['DELETE'])
def delete_book_category(book_category_id):
    if book_categories_model.fetch_book_category_by_id(book_category_id) is None:
        return jsonify({'error': 'Book category not found'}), 404
    book_categories_model.delete_book_category(book_category_id)
    return jsonify({'message': 'Book category deleted successfully'}), 200

