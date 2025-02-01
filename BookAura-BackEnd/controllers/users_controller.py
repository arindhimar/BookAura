from flask import request, jsonify, Blueprint
from models.users import UsersModel

app = Blueprint('users', __name__)
users_model = UsersModel()

@app.route('/', methods=['GET'])
def get_all_users():
    rows = users_model.fetch_all_users()
    # users = [{'user_id': row[0], 'username': row[1], 'email': row[2]} for row in rows]
    return jsonify(rows)

@app.route('/<int:user_id>', methods=['GET'])
def get_user(user_id):
    row = users_model.fetch_user_by_id(user_id)
    if row is None:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(row)

@app.route('/', methods=['POST'])
def create_user():
    data = request.get_json()
    if 'username' not in data or 'email' not in data or 'password_hash' not in data or 'role_id' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
    users_model.create_user(data['username'], data['email'], data['password_hash'], data['role_id'])
    return jsonify({'message': 'User created successfully'}), 201

@app.route('/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.get_json()
    if users_model.fetch_user_by_id(user_id) is None:
        return jsonify({'error': 'User not found'}), 404
    users_model.update_user(user_id, data['username'], data['email'], data['password_hash'], data['role_id'])
    return jsonify({'message': 'User updated successfully'})

@app.route('/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    if users_model.fetch_user_by_id(user_id) is None:
        return jsonify({'error': 'User not found'}), 404
    users_model.delete_user(user_id)
    return jsonify({'message': 'User deleted successfully'}), 200
