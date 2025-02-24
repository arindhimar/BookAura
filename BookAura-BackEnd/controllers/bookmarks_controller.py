from flask import request, jsonify, Blueprint
from models.bookmarks import BookmarksModel
from utils.auth_utils import decode_token

app = Blueprint('bookmarks', __name__)
bookmarks_model = BookmarksModel()

@app.route('/', methods=['GET'])
def get_all_bookmarks():
    rows = bookmarks_model.fetch_all_bookmarks()
    bookmarks = [{'bookmark_id': row[0], 'user_id': row[1], 'book_id': row[2]} for row in rows]
    return jsonify(bookmarks)

@app.route('/<int:bookmark_id>', methods=['GET'])
def get_bookmark(bookmark_id):
    row = bookmarks_model.fetch_bookmark_by_id(bookmark_id)
    if row is None:
        return jsonify({'error': 'Bookmark not found'}), 404
    bookmark = {'bookmark_id': row[0], 'user_id': row[1], 'book_id': row[2]}
    return jsonify(bookmark)

@app.route('/', methods=['POST'])
def create_bookmark():
    data = request.get_json()
    if 'user_id' not in data or 'book_id' not in data:
        return jsonify({'error': 'Missing required field: user_id or book_id'}), 400
    bookmarks_model.create_bookmark(data['user_id'], data['book_id'])
    return jsonify({'message': 'Bookmark created successfully'}), 201

@app.route('/<int:bookmark_id>', methods=['DELETE'])
def delete_bookmark(bookmark_id):
    if bookmarks_model.fetch_bookmark_by_id(bookmark_id) is None:
        return jsonify({'error': 'Bookmark not found'}), 404
    bookmarks_model.delete_bookmark(bookmark_id)
    return jsonify({'message': 'Bookmark deleted successfully'}), 200

@app.route('/user', methods=['GET'])
def get_bookmarks_by_user():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Authorization token is required'}), 401

    decoded_token = decode_token(token)
    if not decoded_token:
        return jsonify({'error': 'Invalid token'}), 401

    user_id = decoded_token['user_id']

    bookmarks = bookmarks_model.fetch_bookmarks_by_user(user_id)

    bookmarks = [{'bookmark_id': row[0], 'user_id': row[1], 'book_id': row[2]} for row in bookmarks]
    return jsonify(bookmarks)

@app.route('/book/<int:book_id>', methods=['GET'])
def get_bookmarks_by_book(book_id):
    bookmarks = bookmarks_model.fetch_bookmarks_by_book(book_id)

    bookmarks = [{'bookmark_id': row[0], 'user_id': row[1], 'book_id': row[2]} for row in bookmarks]
    return jsonify(bookmarks)

@app.route('/book/<int:book_id>/user', methods=['GET'])
def get_bookmarks_by_book_and_user(book_id):
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Authorization token is required'}), 401

    decoded_token = decode_token(token)
    if not decoded_token:
        return jsonify({'error': 'Invalid token'}), 401

    user_id = decoded_token['user_id']

    bookmarks = bookmarks_model.fetch_bookmarks_by_book_and_user(book_id, user_id)
    if bookmarks == None:
        return jsonify({"is_bookmarked":"false"})
    return jsonify({"is_bookmarked":"true"})

@app.route('/book/<int:book_id>/user', methods=['POST'])
def create_bookmark_by_book_and_user(book_id):
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Authorization token is required'}), 401

    decoded_token = decode_token(token)
    if not decoded_token:
        return jsonify({'error': 'Invalid token'}), 401

    user_id = decoded_token['user_id']

    bookmarks_model.add_bookmark(user_id, book_id)
    return jsonify({'message': 'Bookmark created successfully'}), 201

@app.route('/book/<int:book_id>/user', methods=['DELETE'])
def delete_bookmark_by_book_and_user(book_id):
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Authorization token is required'}), 401

    decoded_token = decode_token(token)
    if not decoded_token:
        return jsonify({'error': 'Invalid token'}), 401

    user_id = decoded_token['user_id']

    bookmarks_model.delete_bookmark_by_book_and_user(user_id, book_id)
    return jsonify({'message': 'Bookmark deleted successfully'}), 200
