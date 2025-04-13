import logging
from datetime import datetime, timedelta
from models.base_model import BaseModel

# Configure logging
logger = logging.getLogger(__name__)

class BooksViewsModel(BaseModel):
    def __init__(self):
        super().__init__()
        logger.info("Book views model initialized")
        
    def fetch_all_books_views(self):
        """Fetch all book views."""
        query = 'SELECT * FROM views'
        return self.execute_query(query)
    
    def fetch_book_views_by_id(self, book_id):
        """Fetch views for a specific book."""
        query = """
            SELECT 
                v.book_id, 
                v.book_view
            FROM 
                views v
            WHERE 
                v.book_id = %s
            """
        return self.execute_query_single(query, (book_id,))
    
    def add_view(self, book_id):
        """Add a view to a book."""
        # First check if data already exists
        check_query = "SELECT * FROM views WHERE book_id = %s"
        book = self.execute_query_single(check_query, (book_id,))
        
        if book is None:
            insert_query = "INSERT INTO views (book_id, book_view) VALUES (%s, 1)"
            return self.execute_query(insert_query, (book_id,), commit=True)
        else:
            update_query = "UPDATE views SET book_view = book_view + 1 WHERE book_id = %s"
            return self.execute_query(update_query, (book_id,), commit=True)
    
    def get_daily_views(self, days=7):
        """Handle decimal conversion properly."""
        try:
            days = int(days)
            
            # Get total views
            query = "SELECT SUM(book_view) AS total_views FROM views"
            result = self.execute_query_single(query)
            total_views = float(result['total_views']) if result and result['total_views'] else 0.0

            daily_data = []
            today = datetime.now()

            if total_views > 0:
                remaining = total_views
                for i in range(days):
                    date = today - timedelta(days=i)
                    if i == 0:
                        views = remaining * 0.7
                    elif i == days - 1:
                        views = remaining
                    else:
                        views = remaining * (0.3 / (days - 1))
                    remaining -= views
                    daily_data.append((date.date(), int(views)))
            else:
                daily_data = [(datetime.now().date() - timedelta(days=i), 0) 
                             for i in range(days)]
                return daily_data
        except Exception as e:
            logger.error(f"Daily views error: {e}")
            return [(datetime.now().date() - timedelta(days=i), 0) 
                    for i in range(days)]
    
    def get_monthly_views_by_publisher(self, publisher_id, month=None, year=None):
        """Get total views for a publisher's books."""
        query = """
            SELECT COALESCE(SUM(v.book_view), 0) as total_views
            FROM views v
            JOIN books b ON v.book_id = b.book_id
            WHERE b.user_id = %s
        """
        
        result = self.execute_query_single(query, (publisher_id,))
        return result['total_views'] if result else 0
            
    def get_total_views_by_publisher(self, publisher_id):
        """Get total views for all books by a publisher."""
        query = """
            SELECT COALESCE(SUM(v.book_view), 0) as total_views
            FROM views v
            JOIN books b ON v.book_id = b.book_id
            WHERE b.user_id = %s
        """
        
        result = self.execute_query_single(query, (publisher_id,))
        return result['total_views'] if result else 0
            
    def get_views_distribution_by_publisher(self, publisher_id):
        """Get view distribution across books for a publisher."""
        query = """
            SELECT b.title, v.book_view
            FROM views v
            JOIN books b ON v.book_id = b.book_id
            WHERE b.user_id = %s
            ORDER BY v.book_view DESC
            LIMIT 5
        """
        
        results = self.execute_query(query, (publisher_id,))
        return [{"name": result['title'], "views": result['book_view']} for result in results]
            
    def get_total_views(self):
        """Get total views across all books."""
        query = """
            SELECT COALESCE(SUM(book_view), 0) as total_views
            FROM views
        """
        
        result = self.execute_query_single(query)
        return result['total_views'] if result else 0
                
    def get_views_timeline(self, days=30):
        """Get views timeline for the specified number of days."""
        # Since we don't have actual daily view data, we'll simulate it
        daily_views = self.get_daily_views(days=days)
        
        # Format for the frontend
        timeline_data = [
            {"date": date.strftime("%Y-%m-%d"), "views": views}
            for date, views in daily_views
        ]
        
        return timeline_data
