import jwt
from flask import current_app, jsonify, request
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from models.users import UsersModel
import datetime
import requests

users_model = UsersModel()

def generate_token(user_id, username, role_id):
    """Generates a JWT token."""
    token = jwt.encode(
        {
            'user_id': user_id,
            'username': username,
            'role_id': role_id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=2)
        },
        current_app.config['SECRET_KEY'],
        algorithm='HS256'
    )
    return token

def decode_token(token):
    """Decodes a JWT token and returns the decoded data (or None if invalid)."""
    try:
        decoded = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        return decoded  
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None
def token_required(f):
    """Decorator to verify JWT token and check user role."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Get token from the headers
        auth_header = request.headers.get('Authorization')
        if auth_header:
            try:
                # Split the header and verify it has two parts
                auth_parts = auth_header.split()
                if len(auth_parts) != 2 or auth_parts[0].lower() != 'bearer':
                    return jsonify({'message': 'Authorization header must be in the format: Bearer <token>'}), 401
                token = auth_parts[1]
            except Exception as e:
                return jsonify({'message': 'Invalid Authorization header', 'error': str(e)}), 401
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            data = decode_token(token)
            if data is None:
                return jsonify({'message': 'Token is invalid!'}), 401
            
            # Store user information in the request context
            request.current_user = data
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token is invalid!'}), 401
        except Exception as e:
            return jsonify({'message': 'Token validation failed', 'error': str(e)}), 401
        
        return f(*args, **kwargs)
    return decorated

def validate_password(hashed_password, password):
    """Checks if a password matches its hashed value."""
    if hashed_password is None:
        return False
    elif password is None:
        return False
    if not check_password_hash(hashed_password, password):
        return False
    return True

def validate_password_by_user_id(user_id, password):
    """Checks if a password matches its hashed value."""
    user = users_model.fetch_user_by_id(user_id)
    hashed_password = users_model.fetch_password_hash(user['email'])
    if not user:
        return False
    return validate_password(hashed_password['password_hash'], password)

def validate_password_by_email(email, password):
    """Checks if a password matches its hashed value."""
    hashed_password = users_model.fetch_password_hash(email)
    return validate_password(hashed_password['password_hash'], password)

def encode_password(password):
    """Generates a hashed password."""
    return generate_password_hash(password)

def secure_file_name(filename):
    """Returns a secure version of the given filename."""
    return secure_filename(filename) if filename else None