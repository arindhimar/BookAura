from flask import request, jsonify, Blueprint
from models.reading_history import ReadingHistoryModel
from utils.auth_utils import decode_token

app = Blueprint('reading_history', __name__)
reading_history_model = ReadingHistoryModel()

@app.route('/', methods=['GET'])
def get_all_reading_history():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Authorization token is required'}), 401
    
    decoded_token = decode_token(token)
    if not decoded_token:
        return jsonify({'error': 'Invalid token'}), 401
    rows = reading_history_model.fetch_all_reading_history()
    reading_history = [{'history_id': row[0], 'user_id': row[1], 'book_id': row[2], 'date': row[3]} for row in rows]
    return jsonify(reading_history)

@app.route('/<int:history_id>', methods=['GET'])
def get_reading_history(history_id):
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Authorization token is required'}), 401
    
    decoded_token = decode_token(token)
    if not decoded_token:
        return jsonify({'error': 'Invalid token'}), 401
    
    row = reading_history_model.fetch_reading_history_by_id(history_id)
    if row is None:
        return jsonify({'error': 'Reading history not found'}), 404
    reading_history = {'history_id': row[0], 'user_id': row[1], 'book_id': row[2], 'date': row[3]}
    return jsonify(reading_history)

@app.route('/user', methods=['GET'])
def get_reading_history_by_user():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Authorization token is required'}), 401
    
    decoded_token = decode_token(token)
    if not decoded_token:
        return jsonify({'error': 'Invalid token'}), 401
    
    user_id = decoded_token['user_id']
    
    reading_history = reading_history_model.fetch_reading_history_by_user_id(user_id)
    
    reading_history = [{'history_id': row[0], 'user_id': row[1], 'book_id': row[2], 'date': row[3]} for row in reading_history]
    return jsonify(reading_history)

@app.route('/', methods=['POST'])
def create_reading_history():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Authorization token is required'}), 401
    
    decoded_token = decode_token(token)
    
    if not decoded_token:
        return jsonify({'error': 'Invalid token'}), 401
    
    data = request.get_json()
    if 'book_id' not in data:
        return jsonify({'error': 'Missing required field: user_id or book_id'}), 400
    
    if reading_history_model.fetch_reading_history_by_user_and_book(decoded_token['user_id'], data['book_id']):
            return jsonify({'message': 'Reading history already exists'}), 201

    
    reading_history_model.create_reading_history(decoded_token['user_id'], data['book_id'])
    return jsonify({'message': 'Reading history created successfully'}), 201