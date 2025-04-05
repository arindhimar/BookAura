import mysql.connector

class ReadingHistoryModel:
    def __init__(self):
        self.conn = self.get_db_connection()
        
    def get_db_connection(self):
        return mysql.connector.connect(
            host="localhost",
            database="bookauradb",
            user="root",
            password="root"
        )
    
    def execute_query(self, query, params=None):
        """Execute a query and return the results"""
        try:
            cursor = self.conn.cursor()
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            
            result = cursor.fetchall()
            cursor.close()
            return result
        except Exception as e:
            print(f"Error executing query: {e}")
            return None
        
    def fetch_all_reading_history(self):
        cur = self.conn.cursor()
        cur.execute('SELECT * FROM reading_history')
        reading_history = cur.fetchall()
        cur.close()
        return reading_history

    def fetch_reading_history_by_id(self, history_id):
        cur = self.conn.cursor()
        cur.execute("""
            SELECT 
                rh.history_id, 
                rh.user_id, 
                rh.book_id, 
                rh.last_read_at
            FROM 
                reading_history rh
            WHERE 
                rh.history_id = %s
            """, (history_id,))
        reading_history = cur.fetchone()
        cur.close()
        return reading_history
    
    def fetch_reading_history_by_user_id(self, user_id):
        with self.conn.cursor(dictionary=True) as cur:
            cur.execute("""
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
            reading_history = cur.fetchall()
            return reading_history
    
    def create_reading_history(self, user_id, book_id):
        cur = self.conn.cursor()
        cur.execute("""
            INSERT INTO reading_history (user_id, book_id) 
            VALUES (%s, %s)
            """, (user_id, book_id))
        self.conn.commit()
        cur.close()
        
    def fetch_reading_history_by_user_and_book(self, user_id, book_id):
        cur = self.conn.cursor()
        cur.execute("""
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
        reading_history = cur.fetchone()
        cur.close()
        return reading_history

    def update_last_read(self, user_id, book_id):
        cur = self.conn.cursor()
        cur.execute("""
            UPDATE reading_history
            SET last_read_at = CURRENT_TIMESTAMP
            WHERE user_id = %s AND book_id = %s
            """, (user_id, book_id))
        self.conn.commit()
        cur.close()
    
    def count_active_readers(self, days=30):
        """Count the number of active readers in the last X days"""
        try:
            query = f"""
                SELECT COUNT(DISTINCT user_id) 
                FROM reading_history 
                WHERE last_read_at >= DATE_SUB(NOW(), INTERVAL {days} DAY)
            """
            
            result = self.execute_query(query)
            return result[0][0] if result else 0
        except Exception as e:
            print(f"Error in count_active_readers: {e}")
            return 0
    
    def count_readers_by_publisher(self, publisher_id):
        """Count the number of unique readers who have read books by a specific publisher"""
        try:
            query = """
                SELECT COUNT(DISTINCT rh.user_id) 
                FROM reading_history rh
                JOIN books b ON rh.book_id = b.book_id
                WHERE b.user_id = %s
            """
            
            cursor = self.conn.cursor()
            cursor.execute(query, (publisher_id,))
            result = cursor.fetchone()
            cursor.close()
            
            return result[0] if result else 0
        except Exception as e:
            print(f"Error in count_readers_by_publisher: {e}")
            return 0
    
    def get_recent_readers(self, publisher_id, limit=5):
        """Get the most recent readers of a publisher's books"""
        try:
            query = """
                SELECT u.username, b.title, rh.last_read_at
                FROM reading_history rh
                JOIN books b ON rh.book_id = b.book_id
                JOIN users u ON rh.user_id = u.user_id
                WHERE b.user_id = %s
                ORDER BY rh.last_read_at DESC
                LIMIT %s
            """
            
            cursor = self.conn.cursor()
            cursor.execute(query, (publisher_id, limit))
            results = cursor.fetchall()
            cursor.close()
            
            return [{"reader": reader, "book": book, "date": date} for reader, book, date in results]
        except Exception as e:
            print(f"Error in get_recent_readers: {e}")
            return []
    
    def close_connection(self):
        self.conn.close()
        return True

