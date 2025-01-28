from flask import request, jsonify, Blueprint, current_app
from models.users import UsersModel
from models.platform_administrators import PlatformAdministratorsModel
from models.normal_users import NormalUsersModel
from models.moderator import ModeratorsModel
from models.publisher import PublishersModel
from models.roles import RolesModel

import jwt
import datetime
from werkzeug.security import generate_password_hash, check_password_hash

auth = Blueprint('auth', __name__)
users_model = UsersModel()
platform_administrators_model = PlatformAdministratorsModel()
normal_users_model = NormalUsersModel()
moderators_model = ModeratorsModel()
publishers_model = PublishersModel()

roles_model = RolesModel()

# Generate JWT Token
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


@auth.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    # Validate input fields
    if 'username' not in data or 'email' not in data or 'password' not in data or 'role_id' not in data:
        return jsonify({'error': 'Missing required fields'}), 400

    username = data['username']
    email = data['email']
    password = data['password']
    role_id = data['role_id']

    # Check if the role ID exists in the roles table
    if not roles_model.is_valid_role(role_id):
        return jsonify({'error': 'Invalid role ID'}), 400

    # Check if the user already exists
    if users_model.fetch_user_by_email(email) is not None:
        return jsonify({'error': 'Email is already registered'}), 400

    hashed_password = generate_password_hash(password)

    # Create the user and get the user ID
    user_id = users_model.create_user(username, email, hashed_password, role_id)

    # Assign the user to the appropriate role-specific table
    role_id = int(role_id)
    if role_id == 1:
        platform_administrators_model.create_platform_administrator(user_id)
    elif role_id == 2:
        publishers_model.create_publisher(user_id)
    elif role_id == 3:
        authors_model.create_author(user_id)
    elif role_id == 4:
        normal_users_model.create_normal_user(user_id)
    elif role_id == 5:
        moderators_model.create_moderator(user_id)

    return jsonify({'message': 'User registered successfully', 'user_id': user_id}), 201

@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Missing email or password'}), 400

    email = data['email']
    password = data['password']

    user = users_model.fetch_user_by_email(email)

    if user is None:
        return jsonify({'error': 'Invalid email or password'}), 401

    
    user_id = user.get('user_id')
    username = user.get('username')
    hashed_password = user.get('password_hash')
    role_id = user.get('role_id')


    # Verify password correctness
    if not check_password_hash(hashed_password, password):
        return jsonify({'error': 'Invalid email or password'}), 401

    if role_id == 2:  
        publisher = publishers_model.fetch_publisher_by_user_id(user_id)
        if publisher is None:
            return jsonify({'error': 'Publisher not found'}), 404
        
        if publisher['is_flagged'] == 1:
            return jsonify({'error': 'Your account has been flagged. Contact support.'}), 403
        if publisher['is_approved'] == 0:
            print(publisher['is_approved'])
            return jsonify({'error': 'Your account is not approved yet. Please wait for approval.'}), 403

    token = generate_token(user_id, username, role_id)

    return jsonify({'token': token, 'message': 'Login successful'}), 200

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
