import jwt
from flask import current_app
from werkzeug.security import generate_password_hash, check_password_hash


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

def encode_password(password):
    """Generates a hashed password."""
    return generate_password_hash(password)
