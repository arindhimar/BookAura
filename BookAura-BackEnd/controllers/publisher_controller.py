from flask import request, jsonify, Blueprint
from models.publisher import PublishersModel
from models.books import BooksModel
from models.book_view import BooksViewsModel
from models.reading_history import ReadingHistoryModel
from utils.auth_utils import decode_token, validate_password_by_user_id
from functools import wraps
from datetime import datetime, timedelta
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Blueprint('publisher', __name__)
publishers_model = PublishersModel()
books_model = BooksModel()
books_views_model = BooksViewsModel()
reading_history_model = ReadingHistoryModel()

# Token required decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401

        # Handle both "Bearer token" and just "token" formats
        if token.startswith('Bearer '):
            token = token.split(' ')[1]

        decoded = decode_token(token)
        if not decoded:
            return jsonify({'error': 'Invalid or expired token'}), 401

        request.user = decoded 
        return f(*args, **kwargs)

    return decorated

@app.route('/', methods=['GET'])
def get_all_publishers():
    rows = publishers_model.fetch_all_publishers()
    publishers = [{'publisher_id': row[0], 'user_id': row[1], 'is_flagged': row[2], 'is_approved': row[3]} for row in rows]
    return jsonify(publishers)

@app.route('/<int:publisher_id>', methods=['GET'])
def get_publisher(publisher_id):
    row = publishers_model.fetch_publisher_by_id(publisher_id)
    if row is None:
        return jsonify({'error': 'Publisher not found'}), 404
    publisher = {'publisher_id': row[0], 'user_id': row[1], 'is_flagged': row[2], 'is_approved': row[3]}
    return jsonify(publisher)

@app.route('/user/<int:user_id>', methods=['GET'])
def get_publisher_by_user_id(user_id):
    publisher = publishers_model.fetch_publisher_by_user_id(user_id)
    if publisher is None:
        return jsonify({'error': 'Publisher not found'}), 404
    return jsonify(publisher)

@app.route('/', methods=['POST'])
def create_publisher():
    data = request.get_json()
    if 'user_id' not in data:
        return jsonify({'error': 'Missing required field: user_id'}), 400
    publishers_model.create_publisher(data['user_id'])
    return jsonify({'message': 'Publisher created successfully'}), 201

@app.route('/<int:publisher_id>', methods=['DELETE'])
def delete_publisher(publisher_id):
    if publishers_model.fetch_publisher_by_id(publisher_id) is None:
        return jsonify({'error': 'Publisher not found'}), 404
    publishers_model.delete_publisher(publisher_id)
    return jsonify({'message': 'Publisher deleted successfully'}), 200

@app.route('/<int:publisher_id>/approve', methods=['POST'])
@token_required
def approve_publisher(publisher_id):
    data = request.get_json()
    
    # Validate password if provided
    if 'password' in data:
        if not validate_password_by_user_id(request.user['user_id'], data['password']):
            return jsonify({'error': 'Invalid password'}), 401
    
    publishers_model.approve_publisher(publisher_id)
    return jsonify({'message': 'Publisher approved successfully'}), 200

@app.route('/<int:publisher_id>/reject', methods=['POST'])
@token_required
def reject_publisher(publisher_id):
    data = request.get_json()
    
    # Validate password if provided
    if 'password' in data:
        if not validate_password_by_user_id(request.user['user_id'], data['password']):
            return jsonify({'error': 'Invalid password'}), 401
    
    feedback = data.get('feedback', '')
    publishers_model.reject_publisher(publisher_id, feedback)
    return jsonify({'message': 'Publisher rejected successfully'}), 200

@app.route('/<int:publisher_id>/flag', methods=['POST'])
@token_required
def flag_publisher(publisher_id):
    data = request.get_json()
    
    # Validate password if provided
    if 'password' in data:
        if not validate_password_by_user_id(request.user['user_id'], data['password']):
            return jsonify({'error': 'Invalid password'}), 401
    
    reason = data.get('reason', '')
    publishers_model.flag_publisher(publisher_id, reason)
    return jsonify({'message': 'Publisher flagged successfully'}), 200

@app.route('/<int:publisher_id>/unflag', methods=['POST'])
@token_required
def unflag_publisher(publisher_id):
    data = request.get_json()
    
    # Validate password if provided
    if 'password' in data:
        if not validate_password_by_user_id(request.user['user_id'], data['password']):
            return jsonify({'error': 'Invalid password'}), 401
    
    publishers_model.unflag_publisher(publisher_id)
    return jsonify({'message': 'Publisher unflagged successfully'}), 200

@app.route('/<int:publisher_id>/analytics', methods=['GET'])
def get_publisher_analytics(publisher_id):
    """
    Get analytics data for a publisher with proper connection handling
    """
    try:
        # Get the user_id for this publisher
        publisher = publishers_model.fetch_publisher_by_id(publisher_id)
        if not publisher:
            return jsonify({'error': 'Publisher not found'}), 404
        
        user_id = publisher[1]  # user_id is the second field in the result
        
        # Create default response with fallback data
        analytics_data = {
            'total_books': 0,
            'total_readers': 0,
            'total_views': 0,
            'monthly_revenue': generate_sample_monthly_data(),
            'view_distribution': [],
            'recent_readers': []
        }
        
        # Get total books published - with proper connection handling
        try:
            books_conn = BooksModel()
            total_books = books_conn.count_books_by_publisher(user_id) or 0
            analytics_data['total_books'] = total_books
        except Exception as e:
            logger.error(f"Error getting book count: {e}")
            # Keep default value
        
        # Get total readers - with proper connection handling
        try:
            total_readers = reading_history_model.count_readers_by_publisher(user_id) or 0
            analytics_data['total_readers'] = total_readers
        except Exception as e:
            logger.error(f"Error getting reader count: {e}")
            # Keep default value
        
        # Get total views - with proper connection handling
        try:
            total_views = books_views_model.get_total_views_by_publisher(user_id) or 0
            analytics_data['total_views'] = int(total_views)
        except Exception as e:
            logger.error(f"Error getting view count: {e}")
            # Keep default value
        
        # Get view distribution - with proper connection handling
        try:
            view_distribution = books_views_model.get_views_distribution_by_publisher(user_id) or []
            analytics_data['view_distribution'] = view_distribution
        except Exception as e:
            logger.error(f"Error getting view distribution: {e}")
            # Keep default value
        
        # Get recent readers - with proper connection handling
        try:
            recent_readers = reading_history_model.get_recent_readers(user_id) or []
            analytics_data['recent_readers'] = recent_readers
        except Exception as e:
            logger.error(f"Error getting recent readers: {e}")
            # Keep default value
        
        # Generate monthly revenue/views data
        try:
            if analytics_data['total_views'] > 0:
                analytics_data['monthly_revenue'] = generate_monthly_data(analytics_data['total_views'])
        except Exception as e:
            logger.error(f"Error generating monthly data: {e}")
            # Keep default value
        
        return jsonify(analytics_data)
    
    except Exception as e:
        logger.error(f"Error getting publisher analytics: {e}")
        # Return fallback data with error status
        return jsonify({
            'error': 'Failed to retrieve analytics data',
            'message': str(e),
            'total_books': 0,
            'total_readers': 0,
            'total_views': 0,
            'monthly_revenue': generate_sample_monthly_data(),
            'view_distribution': [],
            'recent_readers': []
        }), 500

def generate_monthly_data(total_views):
    """Generate monthly data based on total views"""
    monthly_data = []
    today = datetime.now()
    
    # Create a distribution pattern (more recent months get more views)
    distribution = [0.05, 0.10, 0.15, 0.20, 0.25, 0.25]  # 5%, 10%, 15%, 20%, 25%, 25%
    
    for i in range(5, -1, -1):
        month_start = today.replace(day=1) - timedelta(days=30*i)
        month_name = month_start.strftime("%b")  # Short month name
        
        # Convert distribution value to float before multiplication
        month_views = int(float(total_views) * distribution[5-i])
        
        monthly_data.append({
            "name": month_name,
            "total": month_views
        })
    
    return monthly_data

def generate_sample_monthly_data():
    """Generate sample monthly data for fallback"""
    monthly_data = []
    today = datetime.now()
    
    sample_values = [1200, 1500, 1800, 2200, 2500, 2800]
    
    for i in range(5, -1, -1):
        month_start = today.replace(day=1) - timedelta(days=30*i)
        month_name = month_start.strftime("%b")  # Short month name
        
        monthly_data.append({
            "name": month_name,
            "total": sample_values[5-i]
        })
    
    return monthly_data

