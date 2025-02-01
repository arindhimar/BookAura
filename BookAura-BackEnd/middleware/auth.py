from flask import request, jsonify, current_app
import jwt
from functools import wraps

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
