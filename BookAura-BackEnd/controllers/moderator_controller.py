from flask import request, jsonify, Blueprint
from models.moderator import ModeratorsModel
from utils.auth_utils import decode_token, validate_password_by_user_id
from functools import wraps

app = Blueprint('moderator', __name__)
moderators_model = ModeratorsModel()

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

@app.route('/<int:moderator_id>/flag', methods=['POST'])
@token_required
def flag_moderator(moderator_id):
    data = request.get_json()
    
    # Validate password if provided
    if 'password' in data:
        if not validate_password_by_user_id(request.user['user_id'], data['password']):
            return jsonify({'error': 'Invalid password'}), 401
    
    reason = data.get('reason', '')
    moderators_model.flag_moderator(moderator_id, reason)
    return jsonify({'message': 'Moderator flagged successfully'}), 200

@app.route('/<int:moderator_id>/unflag', methods=['POST'])
@token_required
def unflag_moderator(moderator_id):
    data = request.get_json()
    
    # Validate password if provided
    if 'password' in data:
        if not validate_password_by_user_id(request.user['user_id'], data['password']):
            return jsonify({'error': 'Invalid password'}), 401
    
    moderators_model.unflag_moderator(moderator_id)
    return jsonify({'message': 'Moderator unflagged successfully'}), 200

@app.route('/dashboard-stats', methods=['GET'])
@token_required
def get_dashboard_stats():
    stats = moderators_model.get_dashboard_stats()
    return jsonify(stats)

@app.route('/content-challenges', methods=['GET'])
@token_required
def get_content_challenges():
    challenges = moderators_model.get_content_challenges()
    return jsonify(challenges)

@app.route('/content-challenges/<int:challenge_id>/review', methods=['POST'])
@token_required
def review_challenge(challenge_id):
    data = request.get_json()
    
    if 'decision' not in data:
        return jsonify({'error': 'Missing required field: decision'}), 400
    
    decision = data['decision']
    comment = data.get('comment', '')
    
    if decision not in ['approve', 'reject']:
        return jsonify({'error': 'Invalid decision. Must be "approve" or "reject"'}), 400
    
    success = moderators_model.review_challenge(challenge_id, decision, comment)
    
    if success:
        return jsonify({'message': f'Challenge {decision}d successfully'}), 200
    else:
        return jsonify({'error': 'Failed to review challenge'}), 500

