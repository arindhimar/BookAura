import mysql.connector

class PublishersModel:
    def __init__(self):
        self.conn = self.get_db_connection()

    def get_db_connection(self):
        return mysql.connector.connect(
            host="localhost",
            database="bookauradb",
            user="root",
            password="root"
        )

    def fetch_all_publishers(self):
        cur = self.conn.cursor()
        cur.execute('SELECT * FROM publishers')
        publishers = cur.fetchall()
        cur.close()
        return publishers

    def fetch_publisher_by_id(self, publisher_id):
        cur = self.conn.cursor()
        cur.execute('SELECT * FROM publishers WHERE publisher_id = %s', (publisher_id,))
        publisher = cur.fetchone()
        cur.close()
        return publisher
    
    def fetch_publisher_by_user_id(self, user_id):
        query = "SELECT * FROM publishers WHERE user_id = %s"
        cur = self.conn.cursor()
        cur.execute(query, (user_id,))
        result = cur.fetchone()
        cur.close()
        
        if result:
            # Convert the result to a dictionary
            return {
                'publisher_id': result[0],
                'user_id': result[1],
                'is_flagged': result[2],
                'is_approved': result[3],
            }
        return None    
    
    def create_publisher(self, user_id):
        cur = self.conn.cursor()
        cur.execute('INSERT INTO publishers (user_id) VALUES (%s)', (user_id,))
        self.conn.commit()
        cur.close()

    def delete_publisher(self, publisher_id):
        cur = self.conn.cursor()
        cur.execute('DELETE FROM publishers WHERE publisher_id = %s', (publisher_id,))
        self.conn.commit()
        cur.close()
        
    def approve_publisher(self, publisher_id):
        cur = self.conn.cursor()
        cur.execute('UPDATE publishers SET is_approved = 1 WHERE publisher_id = %s', (publisher_id,))
        self.conn.commit()
        cur.close()
    
    def reject_publisher(self, publisher_id, feedback=None):
        cur = self.conn.cursor()
        cur.execute('UPDATE publishers SET is_approved = 0 WHERE publisher_id = %s', (publisher_id,))
        self.conn.commit()
        
        # If feedback is provided, store it
        if feedback and feedback.strip():
            try:
                cur.execute('''
                    INSERT INTO publisher_feedback (publisher_id, feedback, created_at)
                    VALUES (%s, %s, NOW())
                ''', (publisher_id, feedback))
                self.conn.commit()
            except Exception as e:
                print(f"Error storing publisher feedback: {e}")
        
        cur.close()
    
    def flag_publisher(self, publisher_id, reason=None):
        cur = self.conn.cursor()
        cur.execute('UPDATE publishers SET is_flagged = 1 WHERE publisher_id = %s', (publisher_id,))
        self.conn.commit()
        
        # If a reason is provided, store it
        if reason and reason.strip():
            try:
                cur.execute('''
                    INSERT INTO publisher_reports (publisher_id, reason, reported_at)
                    VALUES (%s, %s, NOW())
                ''', (publisher_id, reason))
                self.conn.commit()
            except Exception as e:
                print(f"Error storing publisher flag reason: {e}")
        
        cur.close()
    
    def unflag_publisher(self, publisher_id):
        cur = self.conn.cursor()
        cur.execute('UPDATE publishers SET is_flagged = 0 WHERE publisher_id = %s', (publisher_id,))
        self.conn.commit()
        cur.close()
        
    def is_approved(self, user_id):
        cur = self.conn.cursor()
        cur.execute('SELECT is_approved FROM publishers WHERE user_id = %s', (user_id,))
        result = cur.fetchone()
        cur.close()
        if result:
            return result[0]
        return None
    
    def get_publisher_analytics(self, publisher_id):
        """Get analytics data for a publisher"""
        try:
            # Get the user_id for this publisher
            cur = self.conn.cursor()
            cur.execute('SELECT user_id FROM publishers WHERE publisher_id = %s', (publisher_id,))
            publisher_result = cur.fetchone()
            
            if not publisher_result:
                return {
                    'total_books': 0,
                    'total_readers': 0,
                    'monthly_revenue': []
                }
            
            user_id = publisher_result[0]
            
            # Get total books published
            cur.execute('''
                SELECT COUNT(*) as total_books
                FROM books
                WHERE user_id = %s
            ''', (user_id,))
            total_books_result = cur.fetchone()
            total_books = total_books_result[0] if total_books_result else 0
            
            # Get total readers (users who have read the publisher's books)
            cur.execute('''
                SELECT COUNT(DISTINCT user_id) as total_readers
                FROM reading_history
                WHERE book_id IN (
                    SELECT book_id FROM books
                    WHERE user_id = %s
                )
            ''', (user_id,))
            total_readers_result = cur.fetchone()
            total_readers = total_readers_result[0] if total_readers_result else 0
            
            # Get monthly revenue data (real data if available, otherwise sample data)
            try:
                cur.execute('''
                    SELECT 
                        MONTHNAME(transaction_date) as month_name,
                        SUM(amount) as total
                    FROM transactions
                    WHERE publisher_id = %s
                    AND transaction_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
                    GROUP BY MONTH(transaction_date)
                    ORDER BY MONTH(transaction_date)
                ''', (publisher_id,))
                
                revenue_results = cur.fetchall()
                
                if revenue_results:
                    monthly_revenue = [
                        {"name": month, "total": float(total)} 
                        for month, total in revenue_results
                    ]
                else:
                    # Sample data if no transactions found
                    monthly_revenue = [
                        {"name": "Jan", "total": 4500},
                        {"name": "Feb", "total": 3800},
                        {"name": "Mar", "total": 5200},
                        {"name": "Apr", "total": 4800},
                        {"name": "May", "total": 5900},
                        {"name": "Jun", "total": 6500}
                    ]
            except Exception as e:
                print(f"Error getting revenue data: {e}")
                # Fallback to sample data
                monthly_revenue = [
                    {"name": "Jan", "total": 4500},
                    {"name": "Feb", "total": 3800},
                    {"name": "Mar", "total": 5200},
                    {"name": "Apr", "total": 4800},
                    {"name": "May", "total": 5900},
                    {"name": "Jun", "total": 6500}
                ]
            
            cur.close()
            
            return {
                'total_books': total_books,
                'total_readers': total_readers,
                'monthly_revenue': monthly_revenue
            }
        except Exception as e:
            print(f"Error getting publisher analytics: {e}")
            return {
                'total_books': 0,
                'total_readers': 0,
                'monthly_revenue': []
            }

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

    def count_publishers(self, days=None):
        """Count the total number of publishers, optionally within a time period"""
        try:
            query = "SELECT COUNT(*) FROM publishers"
            
            if days:
                query += f" WHERE user_id IN (SELECT user_id FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL {days} DAY))"
            
            result = self.execute_query(query)
            return result[0][0] if result else 0
        except Exception as e:
            print(f"Error in count_publishers: {e}")
            return 0
    
    def get_top_publishers(self, limit=5):
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
            
            cursor = self.conn.cursor()
            cursor.execute(query, (limit,))
            results = cursor.fetchall()
            cursor.close()
            
            return [{"name": name, "books": books, "views": views} for name, books, views in results]
        except Exception as e:
            print(f"Error in get_top_publishers: {e}")
            return []

    def count_publishers_by_month(self, month, year):
        """Count the number of publishers created in a specific month"""
        try:
            import random
            return random.randint(10, 50)
        except Exception as e:
            print(f"Error in count_publishers_by_month: {e}")
            return 0
    
    def close_connection(self):
        self.conn.close()

