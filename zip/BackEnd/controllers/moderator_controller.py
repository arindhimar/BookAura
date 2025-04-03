from flask import request, jsonify, Blueprint
from models.moderator import ModeratorsModel

app = Blueprint('moderator', __name__)
moderators_model = ModeratorsModel()

@app.route('/', methods=['GET'])
def get_all_moderators():
    rows = moderators_model.fetch_all_moderators()
    moderators = [{'moderator_id': row[0], 'user_id': row[1], 'is_flagged': row[2]} for row in rows]
    return jsonify(moderators)

@app.route('/<int:moderator_id>', methods=['GET'])
def get_moderator(moderator_id):
    row = moderators_model.fetch_moderator_by_id(moderator_id)
    if row is None:
        return jsonify({'error': 'Moderator not found'}), 404
    moderator = {'moderator_id': row[0], 'user_id': row[1], 'is_flagged': row[2]}
    return jsonify(moderator)

@app.route('/', methods=['POST'])
def create_moderator():
    data = request.get_json()
    if 'user_id' not in data:
        return jsonify({'error': 'Missing required field: user_id'}), 400
    moderators_model.create_moderator(data['user_id'])
    return jsonify({'message': 'Moderator created successfully'}), 201

@app.route('/<int:moderator_id>', methods=['DELETE'])
def delete_moderator(moderator_id):
    if moderators_model.fetch_moderator_by_id(moderator_id) is None:
        return jsonify({'error': 'Moderator not found'}), 404
    moderators_model.delete_moderator(moderator_id)
    return jsonify({'message': 'Moderator deleted successfully'}), 200

