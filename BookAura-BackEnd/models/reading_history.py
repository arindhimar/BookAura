import mysql.connector
from mysql.connector import pooling
import logging
from datetime import datetime, timedelta

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ReadingHistoryModel:
    def __init__(self):
        try:
            # Initialize connection pool
            self.conn_pool = mysql.connector.pooling.MySQLConnectionPool(
                pool_name="reading_history_pool",
                pool_size=5,
                host="localhost",
                database="bookauradb",
                user="root",
                password="root"
            )
            logger.info("Reading history connection pool initialized")
        except Exception as e:
            logger.error(f"Error initializing connection pool: {e}")
            raise
    
    def get_connection(self):
        """Get a connection from the pool"""
        return self.conn_pool.get_connection()
        
    def execute_query(self, query, params=None, conn=None):
        """Execute a query and return the results"""
        close_conn = False
        try:
            if conn is None:
                conn = self.get_connection()
                close_conn = True
                
            cursor = conn.cursor()
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            
            result = cursor.fetchall()
            return result
        except Exception as e:
            logger.error(f"Error executing query: {e}")
            return None
        finally:
            if cursor:
                cursor.close()
            if close_conn and conn and conn.is_connected():
                conn.close()
        
    def fetch_all_reading_history(self, conn=None):
        close_conn = False
        try:
            if conn is None:
                conn = self.get_connection()
                close_conn = True
                
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM reading_history')
            reading_history = cursor.fetchall()
            return reading_history
        except Exception as e:
            logger.error(f"Error fetching all reading history: {e}")
            return []
        finally:
            if cursor:
                cursor.close()
            if close_conn and conn and conn.is_connected():
                conn.close()

    def fetch_reading_history_by_id(self, history_id, conn=None):
        close_conn = False
        try:
            if conn is None:
                conn = self.get_connection()
                close_conn = True
                
            cursor = conn.cursor()
            cursor.execute("""
                SELECT 
                    rh.history_id, 
                    rh.user_id, 
                    rh.book_id, 
                    rh.last_read_at
                FROM 
                    reading_history rh
                    rh.last_read_at
                FROM 
                    reading_history rh
                WHERE 
                    rh.history_id = %s
                """, (history_id,))
            reading_history = cursor.fetchone()
            return reading_history
        except Exception as e:
            logger.error(f"Error fetching reading history by ID: {e}")
            return None
        finally:
            if cursor:
                cursor.close()
            if close_conn and conn and conn.is_connected():
                conn.close()
    
    def fetch_reading_history_by_user_id(self, user_id, conn=None):
        close_conn = False
        try:
            if conn is None:
                conn = self.get_connection()
                close_conn = True
                
            cursor = conn.cursor(dictionary=True)
            cursor.execute("""
                SELECT 
                    rh.history_id, 
                    rh.user_id, 
                    rh.book_id, 
                    rh.last_read_at,
                    b.book_id AS book_book_id, 
                    b.user_id AS author_id, 
                    u.username AS author_name, 
                    b.title, 
                    b.description, 
                    b.fileUrl, 
                    b.audioUrl,
                    b.is_public, 
                    b.is_approved, 
                    b.uploaded_at, 
                    b.uploaded_by_role,
                    b.coverUrl,
                    COALESCE(GROUP_CONCAT(c.category_name SEPARATOR ', '), '') AS categories,
                    v.book_view AS views  -- Include book views
                FROM 
                    reading_history rh
                LEFT JOIN 
                    books b ON rh.book_id = b.book_id
                LEFT JOIN 
                    book_category bc ON b.book_id = bc.book_id
                LEFT JOIN 
                    categories c ON bc.category_id = c.category_id
                LEFT JOIN 
                    users u ON b.user_id = u.user_id
                LEFT JOIN 
                    views v ON b.book_id = v.book_id  -- Join the views table
                WHERE 
                    rh.user_id = %s
                GROUP BY 
                    rh.history_id, rh.user_id, rh.book_id, rh.last_read_at, 
                    b.book_id, b.user_id, u.username, b.title, b.description, b.fileUrl, b.audioUrl, 
                    b.is_public, b.is_approved, b.uploaded_at, b.uploaded_by_role, v.book_view
            """, (user_id,))
            reading_history = cursor.fetchall()
            return reading_history
        except Exception as e:
            logger.error(f"Error fetching reading history by user ID: {e}")
            return []
        finally:
            if cursor:
                cursor.close()
            if close_conn and conn and conn.is_connected():
                conn.close()
    
    def create_reading_history(self, user_id, book_id, conn=None):
        close_conn = False
        try:
            if conn is None:
                conn = self.get_connection()
                close_conn = True
                
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO reading_history (user_id, book_id) 
                VALUES (%s, %s)
                """, (user_id, book_id))
            conn.commit()
            return True
        except Exception as e:
            logger.error(f"Error creating reading history: {e}")
            if conn:
                conn.rollback()
            return False
        finally:
            if cursor:
                cursor.close()
            if close_conn and conn and conn.is_connected():
                conn.close()
        
    def fetch_reading_history_by_user_and_book(self, user_id, book_id, conn=None):
        close_conn = False
        try:
            if conn is None:
                conn = self.get_connection()
                close_conn = True
                
            cursor = conn.cursor()
            cursor.execute("""
                SELECT 
                    rh.history_id, 
                    rh.user_id, 
                    rh.book_id, 
                    rh.last_read_at
                FROM 
                    reading_history rh
                WHERE 
                    rh.user_id = %s
                AND
                    rh.book_id = %s
                """, (user_id, book_id))
            reading_history = cursor.fetchone()
            return reading_history
        except Exception as e:
            logger.error(f"Error fetching reading history by user and book: {e}")
            return None
        finally:
            if cursor:
                cursor.close()
            if close_conn and conn and conn.is_connected():
                conn.close()

    def update_last_read(self, user_id, book_id, conn=None):
        close_conn = False
        try:
            if conn is None:
                conn = self.get_connection()
                close_conn = True
                
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE reading_history
                SET last_read_at = CURRENT_TIMESTAMP
                WHERE user_id = %s AND book_id = %s
                """, (user_id, book_id))
            conn.commit()
            return True
        except Exception as e:
            logger.error(f"Error updating last read: {e}")
            if conn:
                conn.rollback()
            return False
        finally:
            if cursor:
                cursor.close()
            if close_conn and conn and conn.is_connected():
                conn.close()
    
    def count_active_readers(self, days=30, conn=None):
        """Count the number of active readers in the last X days"""
        close_conn = False
        try:
            if conn is None:
                conn = self.get_connection()
                close_conn = True
                
            cursor = conn.cursor()
            cursor.execute(f"""
                SELECT COUNT(DISTINCT user_id) 
                FROM reading_history 
                WHERE last_read_at >= DATE_SUB(NOW(), INTERVAL {days} DAY)
            """)
            result = cursor.fetchone()
            return result[0] if result else 0
        except Exception as e:
            logger.error(f"Error in count_active_readers: {e}")
            return 0
        finally:
            if cursor:
                cursor.close()
            if close_conn and conn and conn.is_connected():
                conn.close()
    
    def count_readers_by_publisher(self, publisher_id, conn=None):
        """Count the number of unique readers who have read books by a specific publisher"""
        close_conn = False
        try:
            if conn is None:
                conn = self.get_connection()
                close_conn = True
                
            cursor = conn.cursor()
            cursor.execute("""
                SELECT COUNT(DISTINCT rh.user_id) 
                FROM reading_history rh
                JOIN books b ON rh.book_id = b.book_id
                WHERE b.user_id = %s
            """, (publisher_id,))
            result = cursor.fetchone()
            return result[0] if result else 0
        except Exception as e:
            logger.error(f"Error in count_readers_by_publisher: {e}")
            return 0
        finally:
            if cursor:
                cursor.close()
            if close_conn and conn and conn.is_connected():
                conn.close()
    
    def get_recent_readers(self, publisher_id, limit=5, conn=None):
        """Get the most recent readers of a publisher's books"""
        close_conn = False
        try:
            if conn is None:
                conn = self.get_connection()
                close_conn = True
                
            cursor = conn.cursor()
            cursor.execute("""
                SELECT u.username, b.title, rh.last_read_at
                FROM reading_history rh
                JOIN books b ON rh.book_id = b.book_id
                JOIN users u ON rh.user_id = u.user_id
                WHERE b.user_id = %s
                ORDER BY rh.last_read_at DESC
                LIMIT %s
            """, (publisher_id, limit))
            results = cursor.fetchall()
            return [{"reader": reader, "book": book, "date": date} for reader, book, date in results]
        except Exception as e:
            logger.error(f"Error in get_recent_readers: {e}")
            return []
        finally:
            if cursor:
                cursor.close()
            if close_conn and conn and conn.is_connected():
                conn.close()
    
    def get_average_read_time(self, days=30, conn=None):
        """Get the average reading time in minutes (simulated)"""
        # In a real application, you would calculate this from actual reading session data
        # Here we'll return a simulated value
        return 18.5  # Average reading time in minutes
