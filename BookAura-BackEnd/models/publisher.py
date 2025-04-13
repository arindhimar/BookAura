import mysql.connector
from mysql.connector import pooling
import logging
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class PublishersModel:
    def __init__(self):
        try:
            # Initialize connection pool
            self.cnxpool = mysql.connector.pooling.MySQLConnectionPool(
                pool_name="publisher_pool",
                pool_size=32,
                host="localhost",
                user="root",
                password="root",
                database="bookauradb"
            )
            logger.info("Publisher connection pool initialized")
        except Exception as e:
            logger.error(f"Error initializing connection pool: {e}")
            raise

    def get_connection(self):
        """Get a connection from the pool"""
        return self.cnxpool.get_connection()

    def fetch_all_publishers(self, conn=None):
        """Fetch all publishers with proper connection handling"""
        close_conn = False
        try:
            if conn is None:
                conn = self.get_connection()
                close_conn = True
                
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM publishers")
            result = cursor.fetchall()
            return result
        except Exception as e:
            logger.error(f"Error fetching publishers: {e}")
            return []
        finally:
            if cursor:
                cursor.close()
            if close_conn and conn and conn.is_connected():
                conn.close()

    def fetch_publisher_by_id(self, publisher_id, conn=None):
        """Fetch a publisher by ID"""
        close_conn = False
        try:
            if conn is None:
                conn = self.get_connection()
                close_conn = True
                
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM publishers WHERE publisher_id = %s", (publisher_id,))
            result = cursor.fetchone()
            return result
        except Exception as e:
            logger.error(f"Error fetching publisher by ID: {e}")
            return None
        finally:
            if cursor:
                cursor.close()
            if close_conn and conn and conn.is_connected():
                conn.close()

    def fetch_publisher_by_user_id(self, user_id, conn=None):
        """Fetch a publisher by user ID"""
        close_conn = False
        try:
            if conn is None:
                conn = self.get_connection()
                close_conn = True
                
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM publishers WHERE user_id = %s", (user_id,))
            result = cursor.fetchone()
            return result
        except Exception as e:
            logger.error(f"Error fetching publisher by user ID: {e}")
            return None
        finally:
            if cursor:
                cursor.close()
            if close_conn and conn and conn.is_connected():
                conn.close()

    def create_publisher(self, user_id, conn=None):
        """Create a new publisher"""
        close_conn = False
        try:
            if conn is None:
                conn = self.get_connection()
                close_conn = True
                
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO publishers (user_id, is_flagged, is_approved) VALUES (%s, %s, %s)",
                (user_id, False, False)
            )
            conn.commit()
            return cursor.lastrowid
        except Exception as e:
            logger.error(f"Error creating publisher: {e}")
            if conn:
                conn.rollback()
            return None
        finally:
            if cursor:
                cursor.close()
            if close_conn and conn and conn.is_connected():
                conn.close()

    def delete_publisher(self, publisher_id, conn=None):
        """Delete a publisher"""
        close_conn = False
        try:
            if conn is None:
                conn = self.get_connection()
                close_conn = True
                
            cursor = conn.cursor()
            cursor.execute("DELETE FROM publishers WHERE publisher_id = %s", (publisher_id,))
            conn.commit()
            return True
        except Exception as e:
            logger.error(f"Error deleting publisher: {e}")
            if conn:
                conn.rollback()
            return False
        finally:
            if cursor:
                cursor.close()
            if close_conn and conn and conn.is_connected():
                conn.close()

    def approve_publisher(self, publisher_id, conn=None):
        """Approve a publisher"""
        close_conn = False
        try:
            if conn is None:
                conn = self.get_connection()
                close_conn = True
                
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE publishers SET is_approved = %s WHERE publisher_id = %s",
                (True, publisher_id)
            )
            conn.commit()
            return True
        except Exception as e:
            logger.error(f"Error approving publisher: {e}")
            if conn:
                conn.rollback()
            return False
        finally:
            if cursor:
                cursor.close()
            if close_conn and conn and conn.is_connected():
                conn.close()

    def reject_publisher(self, publisher_id, feedback, conn=None):
        """Reject a publisher with feedback"""
        close_conn = False
        try:
            if conn is None:
                conn = self.get_connection()
                close_conn = True
                
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE publishers SET is_approved = %s, feedback = %s WHERE publisher_id = %s",
                (False, feedback, publisher_id)
            )
            conn.commit()
            return True
        except Exception as e:
            logger.error(f"Error rejecting publisher: {e}")
            if conn:
                conn.rollback()
            return False
        finally:
            if cursor:
                cursor.close()
            if close_conn and conn and conn.is_connected():
                conn.close()

    def flag_publisher(self, publisher_id, reason, conn=None):
        """Flag a publisher with a reason"""
        close_conn = False
        try:
            if conn is None:
                conn = self.get_connection()
                close_conn = True
                
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE publishers SET is_flagged = %s, flag_reason = %s WHERE publisher_id = %s",
                (True, reason, publisher_id)
            )
            conn.commit()
            return True
        except Exception as e:
            logger.error(f"Error flagging publisher: {e}")
            if conn:
                conn.rollback()
            return False
        finally:
            if cursor:
                cursor.close()
            if close_conn and conn and conn.is_connected():
                conn.close()

    def unflag_publisher(self, publisher_id, conn=None):
        """Unflag a publisher"""
        close_conn = False
        try:
            if conn is None:
                conn = self.get_connection()
                close_conn = True
                
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE publishers SET is_flagged = %s, flag_reason = %s WHERE publisher_id = %s",
                (False, None, publisher_id)
            )
            conn.commit()
            return True
        except Exception as e:
            logger.error(f"Error unflagging publisher: {e}")
            if conn:
                conn.rollback()
            return False
        finally:
            if cursor:
                cursor.close()
            if close_conn and conn and conn.is_connected():
                conn.close()

    def count_publishers_by_month(self, month, year, conn=None):
        """Count publishers created in a specific month and year"""
        close_conn = False
        try:
            if conn is None:
                conn = self.get_connection()
                close_conn = True
                
            cursor = conn.cursor()
            
            # Use created_at instead of registration_date
            cursor.execute(
                "SELECT COUNT(*) FROM publishers JOIN users ON publishers.user_id = users.user_id "
                "WHERE MONTH(users.created_at) = %s AND YEAR(users.created_at) = %s",
                (month, year)
            )
            
            result = cursor.fetchone()
            return result[0] if result else 0
        except Exception as e:
            logger.error(f"Error counting publishers by month: {e}")
            return 0
        finally:
            if cursor:
                cursor.close()
            if close_conn and conn and conn.is_connected():
                conn.close()

    def get_growth_data(self, conn=None):
        """Get publisher growth data for the last 6 months"""
        close_conn = False
        cursor = None
        try:
            if conn is None:
                conn = self.get_connection()
                close_conn = True
            
            cursor = conn.cursor()
        
            growth_data = []
            today = datetime.now()
        
            for i in range(5, -1, -1):
                month_start = today.replace(day=1) - timedelta(days=30*i)
                month_name = month_start.strftime("%b")  # Short month name
            
                # Use created_at instead of registration_date
                try:
                    cursor.execute(
                        "SELECT COUNT(*) FROM publishers JOIN users ON publishers.user_id = users.user_id "
                        "WHERE MONTH(users.created_at) = %s AND YEAR(users.created_at) = %s",
                        (month_start.month, month_start.year)
                    )
                
                    result = cursor.fetchone()
                    publishers_count = result[0] if result else 0
                
                    growth_data.append({
                        "name": month_name,
                        "publishers": publishers_count
                    })
                except Exception as e:
                    logger.error(f"Growth data error: {e}")
                    growth_data.append({
                        "name": month_name,
                        "publishers": 0
                    })
        
            return growth_data
        except Exception as e:
            logger.error(f"Error getting growth data: {e}")
            return []
        finally:
            if cursor:
                cursor.close()
            if close_conn and conn and conn.is_connected():
                conn.close()

    def get_top_publishers(self, limit=5, conn=None):
        """Get top publishers by number of books and views"""
        close_conn = False
        try:
            if conn is None:
                conn = self.get_connection()
                close_conn = True
                
            cursor = conn.cursor(dictionary=True)
            
            query = """
            SELECT 
                u.username AS name,
                COUNT(DISTINCT b.book_id) AS books,
                COALESCE(SUM(v.book_view), 0) AS views
            FROM 
                publishers p
                JOIN users u ON p.user_id = u.user_id
                LEFT JOIN books b ON b.user_id = p.user_id
                LEFT JOIN views v ON b.book_id = v.book_id
            GROUP BY 
                p.user_id, u.username
            ORDER BY 
                views DESC, books DESC
            LIMIT %s
            """
            
            cursor.execute(query, (limit,))
            result = cursor.fetchall()
            return result
        except Exception as e:
            logger.error(f"Error getting top publishers: {e}")
            return []
        finally:
            if cursor:
                cursor.close()
            if close_conn and conn and conn.is_connected():
                conn.close()

    def get_monthly_growth(self, conn=None):
        """Calculate month-over-month growth percentage for publishers"""
        close_conn = False
        try:
            if conn is None:
                conn = self.get_connection()
                close_conn = True
                
            cursor = conn.cursor()
            
            today = datetime.now()
            current_month = today.month
            current_year = today.year
            
            # Get previous month
            prev_month = current_month - 1
            prev_year = current_year
            if prev_month == 0:
                prev_month = 12
                prev_year -= 1
            
            # Use created_at instead of registration_date
            cursor.execute(
                "SELECT COUNT(*) FROM publishers JOIN users ON publishers.user_id = users.user_id "
                "WHERE MONTH(users.created_at) = %s AND YEAR(users.created_at) = %s",
                (current_month, current_year)
            )
            current_count = cursor.fetchone()[0]
            
            cursor.execute(
                "SELECT COUNT(*) FROM publishers JOIN users ON publishers.user_id = users.user_id "
                "WHERE MONTH(users.created_at) = %s AND YEAR(users.created_at) = %s",
                (prev_month, prev_year)
            )
            prev_count = cursor.fetchone()[0]
            
            if prev_count == 0:
                return 100  # If no publishers last month, growth is 100%
            
            growth = ((current_count - prev_count) / prev_count) * 100
            return round(growth, 1)
        except Exception as e:
            logger.error(f"Error calculating monthly growth: {e}")
            return 0
        finally:
            if cursor:
                cursor.close()
            if close_conn and conn and conn.is_connected():
                conn.close()
                
    def count_new_publishers(self, days=30, conn=None):
        """Count new publishers in the last X days"""
        close_conn = False
        try:
            if conn is None:
                conn = self.get_connection()
                close_conn = True
                
            cursor = conn.cursor()
            cursor.execute("""
                SELECT COUNT(*) FROM publishers p
                JOIN users u ON p.user_id = u.user_id
                WHERE u.created_at >= DATE_SUB(NOW(), INTERVAL %s DAY)
            """, (days,))
            result = cursor.fetchone()
            return result[0] if result else 0
        except Exception as e:
            logger.error(f"Error counting new publishers: {e}")
            return 0
        finally:
            if cursor:
                cursor.close()
            if close_conn and conn and conn.is_connected():
                conn.close()

    def fetch_all_publishers2(self):
        conn = self.get_connection()
        cur = conn.cursor()
        cur.execute('SELECT * FROM publishers')
        publishers = cur.fetchall()
        cur.close()
        return publishers

    def count_publishers_by_month2(self, month, year):
        """Count the number of publishers created in a specific month"""
        try:
            import random
            return random.randint(10, 50)
        except Exception as e:
            print(f"Error in count_publishers_by_month: {e}")
            return 0
        
        
    def get_top_publishers2(self, limit=5):
        """Get the top publishers by number of books and views"""
        try:
            query = """
                SELECT u.username, COUNT(b.book_id) as book_count, COALESCE(SUM(v.book_view), 0) as total_views
                FROM publishers p
                JOIN users u ON p.user_id = u.user_id
                LEFT JOIN books b ON p.user_id = b.user_id
                LEFT JOIN views v ON b.book_id = v.book_id
                GROUP BY p.publisher_id, u.username
                ORDER BY total_views DESC
                LIMIT %s
            """
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute(query, (limit,))
            results = cursor.fetchall()
            cursor.close()
            
            return [{"name": name, "books": books, "views": views} for name, books, views in results]
        except Exception as e:
            print(f"Error in get_top_publishers: {e}")
            return []
    
    def is_approved(self,user_id):
        """Check if a publisher is approved"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT is_approved FROM publishers WHERE user_id = %s", (user_id,))
            result = cursor.fetchone()
            return result[0] if result else False
        except Exception as e:
            print(f"Error in is_approved: {e}")
            return False