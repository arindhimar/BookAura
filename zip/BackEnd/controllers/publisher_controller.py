from flask import request, jsonify, Blueprint
from models.publisher import PublishersModel
from utils.auth_utils import decode_token,validate_password_by_user_id



app = Blueprint('publisher', __name__)
publishers_model = PublishersModel()

@app.route('/', methods=['GET'])
def get_all_publishers():
    rows = publishers_model.fetch_all_publishers()
    publishers = [{'publisher_id': row[0], 'user_id': row[1], 'is_flagged': row[2], 'is_approved': row[3]} for row in rows]
    return jsonify(publishers)

@app.route('/<int:publisher_id>', methods=['GET'])
def get_publisher(publisher_id):
    row = publishers_model.fetch_publisher_by_id(publisher_id)
    if row is None:
        return jsonify({'error': 'Publisher not found'}), 404
    publisher = {'publisher_id': row[0], 'user_id': row[1], 'is_flagged': row[2], 'is_approved': row[3]}
    return jsonify(publisher)

@app.route('/', methods=['POST'])
def create_publisher():
    data = request.get_json()
    if 'user_id' not in data:
        return jsonify({'error': 'Missing required field: user_id'}), 400
    publishers_model.create_publisher(data['user_id'])
    return jsonify({'message': 'Publisher created successfully'}), 201

@app.route('/<int:publisher_id>', methods=['DELETE'])
def delete_publisher(publisher_id):
    if publishers_model.fetch_publisher_by_id(publisher_id) is None:
        return jsonify({'error': 'Publisher not found'}), 404
    publishers_model.delete_publisher(publisher_id)
    return jsonify({'message': 'Publisher deleted successfully'}), 200


@app.route('/<int:publisher_id>/approve', methods=['POST'])
def approve_publisher(publisher_id):
    token = request.headers.get('Authorization').split(' ')[0]
    data = request.get_json()
    
    try:
        user_data = decode_token(token)
        
        if 'password' not in data or 'publisher_id' not in data:
            return jsonify({'error': 'Missing required fields'}), 400
        
        
        if validate_password_by_user_id(user_data['user_id'], data['password']) is False:
            return jsonify({'error': 'Invalid password'}), 401
        
        publishers_model.approve_publisher(publisher_id)
        
        
    except Exception as e:
        return jsonify({'error': str(e)}), 401
    
    
        

    return jsonify({'message': 'Publisher approved successfully'}), 200