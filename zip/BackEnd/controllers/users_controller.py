from flask import request, jsonify, Blueprint
from models.users import UsersModel
from utils.auth_utils import decode_token,validate_password_by_user_id,encode_password



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

@app.route('/', methods=['PUT'])
def update_user():
    """Updates user information after validating the token and password."""
    try:
        # Validate token        
        token = request.headers.get('Authorization').split(' ')[0]
        user_data = decode_token(token)

        if not user_data:
            return jsonify({'error': 'Invalid or expired token'}), 401

        # Parse JSON request body
        data = request.get_json()
        required_fields = {'name', 'email', 'password'}
        
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400


        old_user_data = users_model.fetch_user_by_id(user_data['user_id'])
        if not old_user_data:
            return jsonify({'error': 'User not found'}), 404

            
        # Verify password
        stored_hash = users_model.fetch_password_hash(old_user_data['email'])['password_hash']
        if validate_password_by_user_id(user_data['user_id'], data['password']) is False:
            return jsonify({'error': 'Invalid password'}), 401

        # Update user in the database
        users_model.update_user(
            user_data['user_id'],
            data['name'],
            data['email'],
            stored_hash, 
            old_user_data['role_id']
        )
        return jsonify({'message': 'User updated successfully'}), 200

    except KeyError:
        return jsonify({'error': 'Malformed request data'}), 400
    except Exception as e:
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@app.route('/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    if users_model.fetch_user_by_id(user_id) is None:
        return jsonify({'error': 'User not found'}), 404
    users_model.delete_user(user_id)
    return jsonify({'message': 'User deleted successfully'}), 200


