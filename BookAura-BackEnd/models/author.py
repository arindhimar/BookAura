import mysql.connector

class AuthorsModel:
    def __init__(self):
        self.conn = self.get_db_connection()
        
    def get_db_connection(self):
        return mysql.connector.connect(
            host="localhost",
            database="bookauradb",
            user="root",
            password="root"
        )
    
    def fetch_all_authors(self):
        cur = self.conn.cursor()
        cur.execute('SELECT * FROM authors')
        authors = cur.fetchall()
        cur.close()
        return authors
    
    def fetch_author_by_id(self, author_id):
        cur = self.conn.cursor()
        cur.execute('SELECT * FROM authors WHERE author_id = %s', (author_id,))
        author = cur.fetchone()
        cur.close()
        return author
    
    def fetch_author_by_user_id(self, user_id):
        cur = self.conn.cursor()
        cur.execute('SELECT * FROM authors WHERE user_id = %s', (user_id,))
        author = cur.fetchone()
        cur.close()
        if author:
            return {
                'author_id': author[0],
                'user_id': author[1]
            }
        return None
    
    def create_author(self, user_id):
        cur = self.conn.cursor()
        cur.execute('INSERT INTO authors (user_id) VALUES (%s)', (user_id,))
        self.conn.commit()
        cur.close()
    
    def delete_author(self, author_id):
        cur = self.conn.cursor()
        cur.execute('DELETE FROM authors WHERE author_id = %s', (author_id,))
        self.conn.commit()
        cur.close()
    
    def get_author_dashboard_stats(self, author_id):
        """Get statistics for the author dashboard"""
        try:
            cur = self.conn.cursor(dictionary=True)
            
            # Get total books
            cur.execute('''
                SELECT COUNT(*) as total_books
                FROM books
                WHERE user_id = (SELECT user_id FROM authors WHERE author_id = %s)
            ''', (author_id,))
            total_books = cur.fetchone()['total_books']
            
            # Get total readers
            cur.execute('''
                SELECT COUNT(DISTINCT user_id) as total_readers
                FROM reading_history
                WHERE book_id IN (
                    SELECT book_id FROM books
                    WHERE user_id = (SELECT user_id FROM authors WHERE author_id = %s)
                )
            ''', (author_id,))
            total_readers = cur.fetchone()['total_readers']
            
            # Get average rating
            cur.execute('''
                SELECT AVG(rating) as avg_rating
                FROM book_reviews
                WHERE book_id IN (
                    SELECT book_id FROM books
                    WHERE user_id = (SELECT user_id FROM authors WHERE author_id = %s)
                )
            ''', (author_id,))
            result = cur.fetchone()
            avg_rating = result['avg_rating'] if result['avg_rating'] is not None else 0
            
            cur.close()
            
            return {
                'total_books': total_books,
                'total_readers': total_readers,
                'avg_rating': round(avg_rating, 1)
            }
        except Exception as e:
            print(f"Error getting author dashboard stats: {e}")
            return {
                'total_books': 0,
                'total_readers': 0,
                'avg_rating': 0
            }
    
    def get_author_books(self, author_id):
        """Get all books by an author"""
        try:
            cur = self.conn.cursor(dictionary=True)
            cur.execute('''
                SELECT 
                    b.book_id, 
                    b.title, 
                    b.description,
                    b.is_public,
                    b.is_approved,
                    b.uploaded_at,
                    COALESCE(AVG(r.rating), 0) as rating,
                    COUNT(DISTINCT rh.user_id) as readers
                FROM 
                    books b
                LEFT JOIN 
                    book_reviews r ON b.book_id = r.book_id
                LEFT JOIN 
                    reading_history rh ON b.book_id = rh.book_id
                WHERE 
                    b.user_id = (SELECT user_id FROM authors WHERE author_id = %s)
                GROUP BY 
                    b.book_id
                ORDER BY 
                    b.uploaded_at DESC
            ''', (author_id,))
            books = cur.fetchall()
            cur.close()
            return books
        except Exception as e:
            print(f"Error getting author books: {e}")
            return []
    
    def get_author_reviews(self, author_id):
        """Get all reviews for an author's books"""
        try:
            cur = self.conn.cursor(dictionary=True)
            cur.execute('''
                SELECT 
                    r.review_id,
                    r.book_id,
                    b.title as book_title,
                    r.user_id,
                    u.username as reviewer_name,
                    r.rating,
                    r.comment,
                    r.created_at
                FROM 
                    book_reviews r
                JOIN 
                    books b ON r.book_id = b.book_id
                JOIN 
                    users u ON r.user_id = u.user_id
                WHERE 
                    b.user_id = (SELECT user_id FROM authors WHERE author_id = %s)
                ORDER BY 
                    r.created_at DESC
            ''', (author_id,))
            reviews = cur.fetchall()
            cur.close()
            return reviews
        except Exception as e:
            print(f"Error getting author reviews: {e}")
            return []
    
    def close_connection(self):
        self.conn.close()

