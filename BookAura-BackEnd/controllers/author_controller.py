from flask import request, jsonify, Blueprint
from models.author import AuthorsModel

app = Blueprint('author', __name__)
authors_model = AuthorsModel()


@app.route('/', methods=['GET'])
def get_all_authors():
    rows = authors_model.fetch_all_authors()
    authors = [{'author_id': row[0], 'user_id': row[1], 'is_flagged': row[2], 'is_approved': row[3]} for row in rows]
    return jsonify(authors)

@app.route('/<int:author_id>', methods=['GET'])
def get_author(author_id):
    
    row = authors_model.fetch_author_by_id(author_id)
    print(row)
    if row is None:
        return jsonify({'error': 'author not found'}), 404
    author = {'author_id': row[0], 'user_id': row[1], 'is_flagged': row[2], 'is_approved': row[3]}
    return jsonify(author)

@app.route('/', methods=['POST'])
def create_author():
    data = request.get_json()
    if 'user_id' not in data:
        return jsonify({'error': 'Missing required field: user_id'}), 400
    authors_model.create_author(data['user_id'])
    return jsonify({'message': 'author created successfully'}), 201

@app.route('/<int:author_id>', methods=['DELETE'])
def delete_author(author_id):
    if authors_model.fetch_author_by_id(author_id) is None:
        return jsonify({'error': 'author not found'}), 404
    authors_model.delete_author(author_id)
    return jsonify({'message': 'author deleted successfully'}), 200