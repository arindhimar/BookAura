import jwt
from functools import wraps
from flask import request, jsonify, Blueprint, current_app

from models.users import UsersModel
from models.platform_administrators import PlatformAdministratorsModel
from models.normal_users import NormalUsersModel
from models.moderator import ModeratorsModel
from models.publisher import PublishersModel
from models.roles import RolesModel
from utils.auth_utils import decode_token, validate_password_by_user_id, encode_password, generate_token,validate_password_by_email

auth = Blueprint('auth', __name__)

users_model = UsersModel()
platform_administrators_model = PlatformAdministratorsModel()
normal_users_model = NormalUsersModel()
moderators_model = ModeratorsModel()
publishers_model = PublishersModel()
roles_model = RolesModel()


def get_token_from_headers():
    """Extracts token from the Authorization header."""
    return request.headers.get('Authorization').split(' ')[0]
 


# Middleware: JWT Authentication
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_from_headers()
        if not token:
            return jsonify({'error': 'Token is missing'}), 401

        decoded = decode_token(token)
        if not decoded:
            return jsonify({'error': 'Invalid or expired token'}), 401

        request.user = decoded 
        return f(*args, **kwargs)

    return decorated


@auth.route('/register', methods=['POST'])
def register():
    """Registers a new user."""
    data = request.get_json()
    
    print(data)
    
    required_fields = {'username', 'email', 'password', 'role_id'}

    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    username, email, password, role_id = data['username'], data['email'], data['password'], int(data['role_id'])

    
    if not roles_model.is_valid_role(role_id):
        return jsonify({'error': 'Invalid role ID'}), 400
    if users_model.fetch_user_by_email(email):
        return jsonify({'error': 'Email is already registered'}), 400

    hashed_password = encode_password(password)
    user_id = users_model.create_user(username, email, hashed_password, role_id)
    print(user_id)
    role_mapping = {
        1: platform_administrators_model.create_platform_administrator,
        2: publishers_model.create_publisher,
        4: normal_users_model.create_normal_user,
        5: moderators_model.create_moderator
    }
    if role_id in role_mapping:
        role_mapping[role_id](user_id)
    else:
        return jsonify({'error': 'Invalid role ID'}),

    return jsonify({'message': 'User registered successfully', 'user_id': user_id}), 201


@auth.route('/login', methods=['POST'])
def login():
    """Logs in a user and returns a JWT token."""
    data = request.get_json()

    if 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Missing email or password'}), 400

    email, password = data['email'], data['password']
    user = users_model.fetch_user_by_email(email)

    if not user or not validate_password_by_email(user['email'], password):
        return jsonify({'error': 'Invalid email or password'}), 401

    if user['role_id'] == 2 and not publishers_model.is_approved(user['user_id']):
        return jsonify({'error': 'Publisher not approved'}), 401

    token = generate_token(user['user_id'], user['username'], user['role_id'])
    return jsonify({'token': token, 'message': 'Login successful'}), 200


@auth.route('/validatepassword', methods=['POST'])
@token_required
def validate_password():
    """Validates a user's password."""
    data = request.get_json()
    if 'password' not in data:
        return jsonify({'error': 'Missing password'}), 400

    user_id = request.user['user_id']
    if not validate_password_by_user_id(user_id, data['password']):
        return jsonify({'error': 'Invalid password'}), 401

    return jsonify({'message': 'Password is correct'}), 200


@auth.route('/me', methods=['GET'])
@token_required
def get_user_data():
    """Fetches the logged-in user's data."""
    user_id = request.user['user_id']
    user_data = users_model.fetch_user_by_id(user_id)
    return jsonify({'user': user_data}), 200


@auth.route('/change-password', methods=['PUT'])
@token_required
def change_password():
    """Changes a user's password after verification."""
    data = request.get_json()

    if 'current_password' not in data or 'new_password' not in data:
        return jsonify({'error': 'Missing required fields'}), 400

    user_id = request.user['user_id']
    user = users_model.fetch_user_by_id(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    hashed_password = users_model.fetch_password_hash(user['email'])['password_hash']

    if not check_password_hash(hashed_password, data['current_password']):
        return jsonify({'error': 'Invalid password'}), 401

    new_hashed_password = encode_password(data['new_password'])
    users_model.update_password(user_id, new_hashed_password)

    return jsonify({'message': 'Password updated successfully'}), 200

