import mysql.connector

class ModeratorsModel:
    def __init__(self):
        self.conn = self.get_db_connection()

    def get_db_connection(self):
        return mysql.connector.connect(
            host="localhost",
            database="bookauradb",
            user="root",
            password="root"
        )

    def fetch_all_moderators(self, conn=None):
        """Get all moderators with optional connection reuse"""
        close_conn = False
        try:
            if not conn:
                conn = self._connection_pool.get_connection()
                close_conn = True

            with conn.cursor(dictionary=True) as cur:
                cur.execute("SELECT * FROM moderators")
                return cur.fetchall()
        finally:
            if close_conn and conn.is_connected():
                conn.close()

    def fetch_moderator_by_id(self, moderator_id):
        cur = self.conn.cursor()
        cur.execute('SELECT * FROM moderators WHERE moderator_id = %s', (moderator_id,))
        moderator = cur.fetchone()
        cur.close()
        return moderator

    def create_moderator(self, user_id):
        cur = self.conn.cursor()
        cur.execute('INSERT INTO moderators (user_id) VALUES (%s)', (user_id,))
        self.conn.commit()
        cur.close()

    def delete_moderator(self, moderator_id):
        cur = self.conn.cursor()
        cur.execute('DELETE FROM moderators WHERE moderator_id = %s', (moderator_id,))
        self.conn.commit()
        cur.close()
        
    def flag_moderator(self, moderator_id, reason=None):
        cur = self.conn.cursor()
        cur.execute('UPDATE moderators SET is_flagged = 1 WHERE moderator_id = %s', (moderator_id,))
        self.conn.commit()
        cur.close()
        
        # If a reason is provided, store it in a reports table
        if reason and reason.strip():
            try:
                cur = self.conn.cursor()
                cur.execute('''
                    INSERT INTO moderator_reports (moderator_id, reason, reported_at)
                    VALUES (%s, %s, NOW())
                ''', (moderator_id, reason))
                self.conn.commit()
                cur.close()
            except Exception as e:
                print(f"Error storing moderator flag reason: {e}")
    
    def unflag_moderator(self, moderator_id):
        cur = self.conn.cursor()
        cur.execute('UPDATE moderators SET is_flagged = 0 WHERE moderator_id = %s', (moderator_id,))
        self.conn.commit()
        cur.close()
        
    def get_monthly_growth(self, conn=None):
        close_conn = False
        try:
            if not conn:
                conn = self._connection_pool.get_connection()
                close_conn = True

            with conn.cursor() as cur:
                cur.execute("""
                    SELECT COUNT(*) 
                    FROM moderators 
                    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
                """)
                return cur.fetchone()[0]
        finally:
            if close_conn and conn.is_connected():
                conn.close()
    
    def get_dashboard_stats(self):
        """Get statistics for the moderator dashboard"""
        try:
            # Get pending reviews count
            cur = self.conn.cursor()
            cur.execute('''
                SELECT COUNT(*) FROM content_moderation_challenges 
                WHERE status = 'pending'
            ''')
            pending_reviews = cur.fetchone()[0]
            
            # Get completed reviews count
            cur.execute('''
                SELECT COUNT(*) FROM content_moderation_challenges 
                WHERE status != 'pending'
            ''')
            completed_reviews = cur.fetchone()[0]
            
            # Get approved books count
            cur.execute('''
                SELECT COUNT(*) FROM content_moderation_challenges 
                WHERE status = 'approved'
            ''')
            approved_books = cur.fetchone()[0]
            
            # Get rejected books count
            cur.execute('''
                SELECT COUNT(*) FROM content_moderation_challenges 
                WHERE status = 'rejected'
            ''')
            rejected_books = cur.fetchone()[0]
            
            cur.close()
            
            return {
                'pending_reviews': pending_reviews,
                'completed_reviews': completed_reviews,
                'approved_books': approved_books,
                'rejected_books': rejected_books
            }
        except Exception as e:
            print(f"Error getting moderator dashboard stats: {e}")
            # Return default values if there's an error
            return {
                'pending_reviews': 0,
                'completed_reviews': 0,
                'approved_books': 0,
                'rejected_books': 0
            }
    
    def get_content_challenges(self):
        """Get all content moderation challenges"""
        try:
            cur = self.conn.cursor(dictionary=True)
            cur.execute('''
                SELECT 
                    c.id, 
                    b.title as book_title, 
                    u.username as author_name, 
                    c.rejection_reason, 
                    c.status,
                    c.created_at
                FROM 
                    content_moderation_challenges c
                JOIN 
                    books b ON c.book_id = b.book_id
                JOIN 
                    users u ON b.user_id = u.user_id
                ORDER BY 
                    c.created_at DESC
            ''')
            challenges = cur.fetchall()
            cur.close()
            return challenges
        except Exception as e:
            print(f"Error getting content challenges: {e}")
            return []
    
    def review_challenge(self, challenge_id, decision, comment=None):
        """Review a content moderation challenge"""
        try:
            cur = self.conn.cursor()
            cur.execute('''
                UPDATE content_moderation_challenges
                SET status = %s, moderator_comment = %s, updated_at = NOW()
                WHERE id = %s
            ''', (decision, comment, challenge_id))
            
            # If approved, update the book status
            if decision == 'approve':
                cur.execute('''
                    UPDATE books b
                    JOIN content_moderation_challenges c ON b.book_id = c.book_id
                    SET b.is_approved = 1
                    WHERE c.id = %s
                ''', (challenge_id,))
            
            self.conn.commit()
            cur.close()
            return True
        except Exception as e:
            print(f"Error reviewing challenge: {e}")
            return False

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

    def count_moderators(self, days=None):
        """Count the total number of moderators, optionally within a time period"""
        try:
            query = "SELECT COUNT(*) FROM moderators"
            
            if days:
                query += f" WHERE user_id IN (SELECT user_id FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL {days} DAY))"
            
            result = self.execute_query(query)
            return result[0][0] if result else 0
        except Exception as e:
            print(f"Error in count_moderators: {e}")
            return 0

    def fetch_all_moderators2(self):
        cur = self.conn.cursor()
        cur.execute('SELECT * FROM moderators')
        moderators = cur.fetchall()
        cur.close()
        return moderators
    
    def close_connection(self):
        self.conn.close()

