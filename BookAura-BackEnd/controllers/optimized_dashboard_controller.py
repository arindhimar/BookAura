from flask import Blueprint, jsonify, request
from services.dashboard_service import DashboardService
import logging

# Configure logging
logger = logging.getLogger(__name__)

# Create Blueprint
optimized_dashboard = Blueprint('optimized_dashboard', __name__)

@optimized_dashboard.route('/stats', methods=['GET'])
def get_stats():
    """Get platform statistics."""
    try:
        time_range = request.args.get('timeRange', '30d')
        stats = DashboardService.get_platform_stats(time_range)
        return jsonify(stats)
    except Exception as e:
        logger.error(f"Error in get_stats endpoint: {e}")
        return jsonify({"error": "Failed to retrieve statistics"}), 500

@optimized_dashboard.route('/chart-data', methods=['GET'])
def get_chart_data():
    """Get chart data for book views over time."""
    try:
        time_range = request.args.get('timeRange', '30d')
        data = DashboardService.get_chart_data(time_range)
        return jsonify(data)
    except Exception as e:
        logger.error(f"Error in get_chart_data endpoint: {e}")
        return jsonify({"error": "Failed to retrieve chart data"}), 500

@optimized_dashboard.route('/publisher-growth', methods=['GET'])
def get_publisher_growth():
    """Get publisher growth data."""
    try:
        time_range = request.args.get('timeRange', '30d')
        data = DashboardService.get_publisher_growth_data(time_range)
        return jsonify(data)
    except Exception as e:
        logger.error(f"Error in get_publisher_growth endpoint: {e}")
        return jsonify({"error": "Failed to retrieve publisher growth data"}), 500

@optimized_dashboard.route('/category-distribution', methods=['GET'])
def get_category_distribution():
    """Get book category distribution."""
    try:
        data = DashboardService.get_category_distribution()
        return jsonify(data)
    except Exception as e:
        logger.error(f"Error in get_category_distribution endpoint: {e}")
        return jsonify({"error": "Failed to retrieve category distribution data"}), 500

@optimized_dashboard.route('/top-content', methods=['GET'])
def get_top_content():
    """Get top publishers and books."""
    try:
        data = DashboardService.get_top_content()
        return jsonify(data)
    except Exception as e:
        logger.error(f"Error in get_top_content endpoint: {e}")
        return jsonify({"error": "Failed to retrieve top content data"}), 500

@optimized_dashboard.route('/all-data', methods=['GET'])
def get_all_data():
    """Get all dashboard data in a single request."""
    try:
        time_range = request.args.get('timeRange', '30d')
        data = DashboardService.get_all_dashboard_data(time_range)
        return jsonify(data)
    except Exception as e:
        logger.error(f"Error in get_all_data endpoint: {e}")
        return jsonify({"error": "Failed to retrieve dashboard data"}), 500
