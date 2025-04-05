from flask import request, jsonify, Blueprint
from models.author import AuthorsModel
from utils.auth_utils import decode_token
from functools import wraps

app = Blueprint('author', __name__)
authors_model = AuthorsModel()

# Token required decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401

        # Handle both "Bearer token" and just "token" formats
        if token.startswith('Bearer '):
            token = token.split(' ')[1]

        decoded = decode_token(token)
        if not decoded:
            return jsonify({'error': 'Invalid or expired token'}), 401

        request.user = decoded 
        return f(*args, **kwargs)

    return decorated

@app.route('/', methods=['GET'])
def get_all_authors():
    rows = authors_model.fetch_all_authors()
    authors = [{'author_id': row[0], 'user_id': row[1]} for row in rows]
    return jsonify(authors)

@app.route('/<int:author_id>', methods=['GET'])
def get_author(author_id):
    row = authors_model.fetch_author_by_id(author_id)
    if row is None:
        return jsonify({'error': 'Author not found'}), 404
    author = {'author_id': row[0], 'user_id': row[1]}
    return jsonify(author)

@app.route('/', methods=['POST'])
def create_author():
    data = request.get_json()
    if 'user_id' not in data:
        return jsonify({'error': 'Missing required field: user_id'}), 400
    authors_model.create_author(data['user_id'])
    return jsonify({'message': 'Author created successfully'}), 201

@app.route('/<int:author_id>', methods=['DELETE'])
def delete_author(author_id):
    if authors_model.fetch_author_by_id(author_id) is None:
        return jsonify({'error': 'Author not found'}), 404
    authors_model.delete_author(author_id)
    return jsonify({'message': 'Author deleted successfully'}), 200

@app.route('/<int:author_id>/dashboard-stats', methods=['GET'])
@token_required
def get_dashboard_stats(author_id):
    stats = authors_model.get_author_dashboard_stats(author_id)
    return jsonify(stats)

@app.route('/<int:author_id>/books', methods=['GET'])
@token_required
def get_author_books(author_id):
    books = authors_model.get_author_books(author_id)
    return jsonify(books)

@app.route('/<int:author_id>/reviews', methods=['GET'])
@token_required
def get_author_reviews(author_id):
    reviews = authors_model.get_author_reviews(author_id)
    return jsonify(reviews)

