from flask import request, jsonify, Blueprint
from models.platform_administrators import PlatformAdministratorsModel
from models.publisher import PublishersModel
from models.moderator import ModeratorsModel
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

app = Blueprint('platform_administrator', __name__)
platform_administrator_model = PlatformAdministratorsModel()
publishers_model = PublishersModel()
moderator_model = ModeratorsModel()
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
def get_all_platform_administrators():
    rows = platform_administrator_model.fetch_all_platform_administrators()
    admins = [{'admin_id': row[0], 'user_id': row[1]} for row in rows]
    return jsonify(admins)

@app.route('/<int:admin_id>', methods=['GET'])
def get_platform_administrator(admin_id):
    row = platform_administrator_model.fetch_platform_administrator_by_id(admin_id)
    if row is None:
        return jsonify({'error': 'Administrator not found'}), 404
    admin = {'admin_id': row[0], 'user_id': row[1]}
    return jsonify(admin)

@app.route('/', methods=['POST'])
def create_platform_administrator():
    data = request.get_json()
    if 'user_id' not in data:
        return jsonify({'error': 'Missing required field: user_id'}), 400
    platform_administrator_model.create_platform_administrator(data['user_id'])
    return jsonify({'message': 'Platform administrator created successfully'}), 201

@app.route('/<int:admin_id>', methods=['DELETE'])
def delete_platform_administrator(admin_id):
    if platform_administrator_model.fetch_platform_administrator_by_id(admin_id) is None:
        return jsonify({'error': 'Administrator not found'}), 404
    platform_administrator_model.delete_platform_administrator(admin_id)
    return jsonify({'message': 'Platform administrator deleted successfully'}), 200

@app.route('/dashboard/stats', methods=['GET'])
@token_required
def get_dashboard_stats():
    try:
        # Get total number of publishers
        total_publishers = len(publishers_model.fetch_all_publishers())
        
        # Get total number of moderators
        total_moderators = len(moderator_model.fetch_all_moderators())
        
        # Get total number of books
        total_books = len(books_model.fetch_all_books())
        
        # Get total number of flagged content
        flagged_publishers = len([p for p in publishers_model.fetch_all_publishers() if p[2] == 1])  # is_flagged is at index 2
        
        # Get active readers in the last 30 days
        active_readers = reading_history_model.count_active_readers(30)
        
        # Get total views
        total_views = books_views_model.get_total_views()
        
        # Calculate month-over-month changes (for demonstration)
        # In a real app, you would compare with last month's data
        publisher_change = "15%"
        moderator_change = "8%"
        book_change = "22%"
        flagged_change = "5%"
        
        stats = [
            {
                "title": "Total Publishers",
                "value": total_publishers,
                "icon": "Users",
                "trend": "up",
                "change": publisher_change
            },
            {
                "title": "Total Moderators",
                "value": total_moderators,
                "icon": "Users",
                "trend": "up",
                "change": moderator_change
            },
            {
                "title": "Total Books",
                "value": total_books,
                "icon": "Book",
                "trend": "up",
                "change": book_change
            },
            {
                "title": "Flagged Content",
                "value": flagged_publishers,
                "icon": "Flag",
                "trend": "up",
                "change": flagged_change
            }
        ]
        
        return jsonify(stats)
    except Exception as e:
        logger.error(f"Error getting dashboard stats: {e}")
        return jsonify({
            'error': 'Failed to retrieve dashboard statistics',
            'message': str(e)
        }), 500

@app.route('/dashboard/chart-data', methods=['GET'])
@token_required
def get_chart_data():
    try:
        time_range = request.args.get('timeRange', '7d')
        
        days = 7
        if time_range == '30d':
            days = 30
        elif time_range == '90d':
            days = 90
        
        # Get daily views data
        daily_views = books_views_model.get_daily_views(days)
        
        # Format the data for the chart
        chart_data = []
        
        if time_range == '7d':
            # For 7 days, show each day
            for i in range(min(len(daily_views), 7)):
                date, views = daily_views[i]
                chart_data.append({
                    "name": date.strftime("%a"),  # Day name (e.g., Mon, Tue)
                    "value": views
                })
        elif time_range == '30d':
            # For 30 days, group by week
            weeks = {}
            for i in range(min(len(daily_views), 30)):
                date, views = daily_views[i]
                week_num = date.isocalendar()[1]  # Get ISO week number
                if week_num not in weeks:
                    weeks[week_num] = 0
                weeks[week_num] += views
            
            for week_num, views in weeks.items():
                chart_data.append({
                    "name": f"Week {week_num}",
                    "value": views
                })
        elif time_range == '90d':
            # For 90 days, group by month
            months = {}
            for i in range(min(len(daily_views), 90)):
                date, views = daily_views[i]
                month = date.strftime("%b")  # Month name (e.g., Jan, Feb)
                if month not in months:
                    months[month] = 0
                months[month] += views
            
            for month, views in months.items():
                chart_data.append({
                    "name": month,
                    "value": views
                })
        
        return jsonify(chart_data)
    except Exception as e:
        logger.error(f"Error getting chart data: {e}")
        return jsonify({
            'error': 'Failed to retrieve chart data',
            'message': str(e)
        }), 500

@app.route('/dashboard/publisher-growth', methods=['GET'])
@token_required
def get_publisher_growth():
    try:
        # Get publisher growth data for the last 6 months
        growth_data = []
        today = datetime.now()
        
        for i in range(5, -1, -1):
            month_start = today.replace(day=1) - timedelta(days=30*i)
            month_name = month_start.strftime("%b")  # Short month name
            
            # Get publishers created in this month
            # This is a placeholder - you would need to implement this in your model
            publishers_count = publishers_model.count_publishers_by_month(month_start.month, month_start.year)
            
            growth_data.append({
                "name": month_name,
                "publishers": publishers_count
            })
        
        return jsonify(growth_data)
    except Exception as e:
        logger.error(f"Error getting publisher growth: {e}")
        return jsonify({
            'error': 'Failed to retrieve publisher growth data',
            'message': str(e)
        }), 500

@app.route('/dashboard/category-distribution', methods=['GET'])
@token_required
def get_category_distribution():
    try:
        # Get book distribution by category
        category_data = books_model.get_books_by_category()
        
        return jsonify(category_data)
    except Exception as e:
        logger.error(f"Error getting category distribution: {e}")
        return jsonify({
            'error': 'Failed to retrieve category distribution data',
            'message': str(e)
        }), 500

@app.route('/dashboard/top-content', methods=['GET'])
@token_required
def get_top_content():
    try:
        # Get top publishers, books, and moderators
        top_publishers = publishers_model.get_top_publishers(5)
        top_books = books_model.get_top_books(5)
        
        return jsonify({
            "top_publishers": top_publishers,
            "top_books": top_books
        })
    except Exception as e:
        logger.error(f"Error getting top content: {e}")
        return jsonify({
            'error': 'Failed to retrieve top content data',
            'message': str(e)
        }), 500

# New consolidated endpoint for all dashboard data
@app.route('/dashboard/all-data', methods=['GET'])
@token_required
def get_all_dashboard_data():
    try:
        time_range = request.args.get('timeRange', '7d')
        
        # Create a new connection for each model operation to avoid "Commands out of sync" error
        # Get dashboard stats
        total_publishers = len(publishers_model.fetch_all_publishers())
        total_moderators = len(moderator_model.fetch_all_moderators())
        total_books = len(books_model.fetch_all_books())
        flagged_publishers = len([p for p in publishers_model.fetch_all_publishers() if p[2] == 1])
        
        # Calculate month-over-month changes (for demonstration)
        publisher_change = "15%"
        moderator_change = "8%"
        book_change = "22%"
        flagged_change = "5%"
        
        stats = [
            {
                "title": "Total Publishers",
                "value": total_publishers,
                "icon": "Users",
                "trend": "up",
                "change": publisher_change
            },
            {
                "title": "Total Moderators",
                "value": total_moderators,
                "icon": "Users",
                "trend": "up",
                "change": moderator_change
            },
            {
                "title": "Total Books",
                "value": total_books,
                "icon": "Book",
                "trend": "up",
                "change": book_change
            },
            {
                "title": "Flagged Content",
                "value": flagged_publishers,
                "icon": "Flag",
                "trend": "up",
                "change": flagged_change
            }
        ]
        
        # Get chart data
        days = 7
        if time_range == '30d':
            days = 30
        elif time_range == '90d':
            days = 90
        
        daily_views = books_views_model.get_daily_views(days)
        chart_data = []
        
        if time_range == '7d':
            for i in range(min(len(daily_views), 7)):
                date, views = daily_views[i]
                chart_data.append({
                    "name": date.strftime("%a"),
                    "value": views
                })
        elif time_range == '30d':
            weeks = {}
            for i in range(min(len(daily_views), 30)):
                date, views = daily_views[i]
                week_num = date.isocalendar()[1]
                if week_num not in weeks:
                    weeks[week_num] = 0
                weeks[week_num] += views
            
            for week_num, views in weeks.items():
                chart_data.append({
                    "name": f"Week {week_num}",
                    "value": views
                })
        elif time_range == '90d':
            months = {}
            for i in range(min(len(daily_views), 90)):
                date, views = daily_views[i]
                month = date.strftime("%b")
                if month not in months:
                    months[month] = 0
                months[month] += views
            
            for month, views in months.items():
                chart_data.append({
                    "name": month,
                    "value": views
                })
        
        # Get publisher growth data
        growth_data = []
        today = datetime.now()
        
        for i in range(5, -1, -1):
            month_start = today.replace(day=1) - timedelta(days=30*i)
            month_name = month_start.strftime("%b")
            publishers_count = publishers_model.count_publishers_by_month(month_start.month, month_start.year)
            
            growth_data.append({
                "name": month_name,
                "publishers": publishers_count
            })
        
        # Get category distribution data
        category_data = books_model.get_books_by_category()
        
        # Get top content data
        top_publishers = publishers_model.get_top_publishers(5)
        top_books = books_model.get_top_books(5)
        
        # Combine all data into a single response
        dashboard_data = {
            "stats": stats,
            "chartData": chart_data,
            "publisherGrowthData": growth_data,
            "categoryDistributionData": category_data,
            "topContent": {
                "top_publishers": top_publishers,
                "top_books": top_books
            }
        }
        
        return jsonify(dashboard_data)
    except Exception as e:
        logger.error(f"Error getting all dashboard data: {e}")
        return jsonify({
            'error': 'Failed to retrieve dashboard data',
            'message': str(e)
        }), 500

