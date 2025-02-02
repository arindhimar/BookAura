import jwt
from flask import current_app
from werkzeug.security import generate_password_hash, check_password_hash
from models.users import UsersModel
import datetime



users_model = UsersModel()

def generate_token(user_id, username, role_id):
    """Generates a JWT token."""
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

def decode_token(token):
    """Decodes a JWT token and returns the decoded data (or None if invalid)."""
    try:
        decoded = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        return decoded  
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None  
    
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
