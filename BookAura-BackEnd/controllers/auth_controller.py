from flask import request, jsonify, Blueprint, current_app
from models.users import UsersModel
from models.platform_administrators import PlatformAdministratorsModel
from models.normal_users import NormalUsersModel
from models.moderator import ModeratorsModel
from models.publisher import PublishersModel
from models.roles import RolesModel

import jwt
import datetime
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash

auth = Blueprint('auth', __name__)

users_model = UsersModel()
platform_administrators_model = PlatformAdministratorsModel()
normal_users_model = NormalUsersModel()
moderators_model = ModeratorsModel()
publishers_model = PublishersModel()
roles_model = RolesModel()

# Utility: Generate JWT Token
def generate_token(user_id, username, role_id):
    token = jwt.encode(
        {
            'user_id': user_id,
            'username': username,
            'role_id': role_id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        },
        current_app.config['SECRET_KEY'],
        algorithm='HS256'
    )
    return token

# Middleware: JWT Authentication
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            token = token.split(" ")[1]  # Bearer <token>
            decoded = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            request.user = decoded  # Attach user data to request
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401

        return f(*args, **kwargs)
    
    return decorated

# Register User
@auth.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    required_fields = ['username', 'email', 'password', 'role_id']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    username, email, password, role_id = data['username'], data['email'], data['password'], data['role_id']

    if not roles_model.is_valid_role(role_id):
        return jsonify({'error': 'Invalid role ID'}), 400

    if users_model.fetch_user_by_email(email):
        return jsonify({'error': 'Email is already registered'}), 400

    hashed_password = generate_password_hash(password)
    user_id = users_model.create_user(username, email, hashed_password, role_id)

    # Assign user to the correct role table
    role_id = int(role_id)
    role_mapping = {
        1: platform_administrators_model.create_platform_administrator,
        2: publishers_model.create_publisher,
        3: normal_users_model.create_normal_user,
        4: moderators_model.create_moderator
    }

    if role_id in role_mapping:
        role_mapping[role_id](user_id)

    return jsonify({'message': 'User registered successfully', 'user_id': user_id}), 201

# Login User
@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Missing email or password'}), 400

    email, password = data['email'], data['password']
    user = users_model.fetch_user_by_email(email)

    if user is None or not check_password_hash(user['password_hash'], password):
        return jsonify({'error': 'Invalid email or password'}), 401

    token = generate_token(user['user_id'], user['username'], user['role_id'])
    return jsonify({'token': token, 'message': 'Login successful'}), 200

# Validate Password
@auth.route('/validatepassword', methods=['POST'])
@token_required
def validate_password():
    data = request.get_json()
    if 'password' not in data:
        return jsonify({'error': 'Missing password'}), 400

    user_id = request.user['user_id']
    user = users_model.fetch_user_by_id(user_id)

    if not check_password_hash(user['password_hash'], data['password']):
        return jsonify({'error': 'Invalid password'}), 401

    return jsonify({'message': 'Password is correct'}), 200

@auth.route('/me', methods=['GET'])
def get_user_data():
    token = request.headers.get('Authorization').split(' ')[0]
    try:
        decoded = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        user_id = decoded.get('user_id')
        user_data = users_model.fetch_user_by_id(user_id)
        return jsonify({'user': user_data}), 200
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token'}), 401

@auth.route('/change-password', methods=['PUT'])
def change_password():
    
    data = request.get_json()
    
    if 'current_password' not in data or 'new_password' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
    
    token = request.headers.get('Authorization').split(' ')[0]
    print(token)
    try:
        decoded = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        user_id = decoded.get('user_id')
        
        user = users_model.fetch_user_by_id(user_id)
        
        
        hashed_password = users_model.fetch_password_hash(user['email'])
        
        if not check_password_hash(hashed_password['password_hash'], data['current_password']):
            return jsonify({'error': 'Invalid password'}), 401
        
        new_hashed_password = generate_password_hash(data['new_password'])
        users_model.update_password(user_id, new_hashed_password)
        
        return jsonify({'message': 'Password updated successfully'}), 200
        
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500


    return jsonify({'message': 'Password updated successfully'}), 200
    