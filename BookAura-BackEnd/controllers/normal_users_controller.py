from flask import request, jsonify, Blueprint
from models.normal_users import NormalUsersModel

app = Blueprint('normal_users', __name__)
normal_users_model = NormalUsersModel()

@app.route('/normal_users', methods=['GET'])
def get_all_normal_users():
    rows = normal_users_model.fetch_all_normal_users()
    normal_users = [{'normal_user_id': row[0], 'user_id': row[1], 'additional_info': row[2]} for row in rows]
    return jsonify(normal_users)

@app.route('/normal_users/<int:normal_user_id>', methods=['GET'])
def get_normal_user(normal_user_id):
    row = normal_users_model.fetch_normal_user_by_id(normal_user_id)
    if row is None:
        return jsonify({'error': 'Normal user not found'}), 404
    normal_user = {'normal_user_id': row[0], 'user_id': row[1], 'additional_info': row[2]}
    return jsonify(normal_user)

@app.route('/normal_users', methods=['POST'])
def create_normal_user():
    data = request.get_json()
    if 'user_id' not in data or 'additional_info' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
    normal_users_model.create_normal_user(data['user_id'], data['additional_info'])
    return jsonify({'message': 'Normal user created successfully'}), 201

@app.route('/normal_users/<int:normal_user_id>', methods=['PUT'])
def update_normal_user(normal_user_id):
    data = request.get_json()
    if normal_users_model.fetch_normal_user_by_id(normal_user_id) is None:
        return jsonify({'error': 'Normal user not found'}), 404
    normal_users_model.update_normal_user(normal_user_id, data['additional_info'])
    return jsonify({'message': 'Normal user updated successfully'})

@app.route('/normal_users/<int:normal_user_id>', methods=['DELETE'])
def delete_normal_user(normal_user_id):
    if normal_users_model.fetch_normal_user_by_id(normal_user_id) is None:
        return jsonify({'error': 'Normal user not found'}), 404
    normal_users_model.delete_normal_user(normal_user_id)
    return jsonify({'message': 'Normal user deleted successfully'}), 200
