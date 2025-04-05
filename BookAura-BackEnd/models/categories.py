import mysql.connector
import traceback
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CategoriesModel:
    def __init__(self):
        self.conn = None
        try:
            self.conn = self.get_db_connection()
        except Exception as e:
            logger.error(f"Database connection error: {str(e)}")
            traceback.print_exc()
    
    def get_db_connection(self):
        try:
            return mysql.connector.connect(
                host="localhost",
                database="bookauradb",
                user="root",
                password="root",
                autocommit=False
            )
        except mysql.connector.Error as err:
            logger.error(f"MySQL connection error: {err}")
            raise
    
    def fetch_all_categories(self):
        try:
            if not self.conn or not self.conn.is_connected():
                self.conn = self.get_db_connection()
                
            cur = self.conn.cursor()
            cur.execute('SELECT * FROM categories')
            categories = cur.fetchall()
            cur.close()
            return categories
        except Exception as e:
            logger.error(f"Error fetching all categories: {str(e)}")
            traceback.print_exc()
            return []
    
    def fetch_category_by_id(self, category_id):
        try:
            if not self.conn or not self.conn.is_connected():
                self.conn = self.get_db_connection()
                
            cur = self.conn.cursor()
            cur.execute('SELECT * FROM categories WHERE category_id = %s', (category_id,))
            category = cur.fetchone()
            cur.close()
            return category
        except Exception as e:
            logger.error(f"Error fetching category by ID {category_id}: {str(e)}")
            traceback.print_exc()
            return None
    
    def fetch_category_by_name(self, category_name):
        try:
            if not self.conn or not self.conn.is_connected():
                self.conn = self.get_db_connection()
                
            cur = self.conn.cursor()
            cur.execute('SELECT * FROM categories WHERE category_name = %s', (category_name,))
            category = cur.fetchone()
            cur.close()
            return category
        except Exception as e:
            logger.error(f"Error fetching category by name '{category_name}': {str(e)}")
            traceback.print_exc()
            return None
    
    def create_category(self, category_name):
        try:
            if not self.conn or not self.conn.is_connected():
                self.conn = self.get_db_connection()
                
            cur = self.conn.cursor()
            cur.execute('INSERT INTO categories (category_name) VALUES (%s)', (category_name,))
            self.conn.commit()
            cur.close()
            return True
        except Exception as e:
            if self.conn and self.conn.is_connected():
                self.conn.rollback()
            logger.error(f"Error creating category '{category_name}': {str(e)}")
            traceback.print_exc()
            return False
        
    def update_category(self, category_id, category_name):
        try:
            if not self.conn or not self.conn.is_connected():
                self.conn = self.get_db_connection()
                
            cur = self.conn.cursor()
            cur.execute('UPDATE categories SET category_name = %s WHERE category_id = %s', (category_name, category_id))
            self.conn.commit()
            cur.close()
            return True
        except Exception as e:
            if self.conn and self.conn.is_connected():
                self.conn.rollback()
            logger.error(f"Error updating category {category_id}: {str(e)}")
            traceback.print_exc()
            return False
    
    def delete_category(self, category_id):
        try:
            if not self.conn or not self.conn.is_connected():
                self.conn = self.get_db_connection()
                
            cur = self.conn.cursor()
            # First delete category associations
            cur.execute('DELETE FROM book_category WHERE category_id = %s', (category_id,))
            # Then delete the category
            cur.execute('DELETE FROM categories WHERE category_id = %s', (category_id,))
            self.conn.commit()
            cur.close()
            return True
        except Exception as e:
            if self.conn and self.conn.is_connected():
                self.conn.rollback()
            logger.error(f"Error deleting category {category_id}: {str(e)}")
            traceback.print_exc()
            return False
        
    def fetch_books_category_wise(self):
        try:
            if not self.conn or not self.conn.is_connected():
                self.conn = self.get_db_connection()

            # Use dictionary cursor for safer column access
            with self.conn.cursor(dictionary=True) as cur:
                # Modified query to include views and handle NULL categories
                cur.execute("""
                    SELECT 
                        COALESCE(c.category_name, 'Uncategorized') AS category_name,
                        b.book_id, 
                        b.title,
                        b.description,
                        b.fileUrl,
                        b.audioUrl,
                        b.coverUrl,
                        b.is_public,
                        b.is_approved,
                        b.uploaded_at,
                        b.uploaded_by_role,
                        COALESCE(SUM(v.book_view), 0) AS views,
                        u.username AS author_name
                    FROM books b
                    LEFT JOIN book_category bc ON b.book_id = bc.book_id
                    LEFT JOIN categories c ON bc.category_id = c.category_id
                    LEFT JOIN users u ON b.user_id = u.user_id
                    LEFT JOIN views v ON b.book_id = v.book_id
                    WHERE b.is_approved = 0
                    GROUP BY b.book_id, c.category_name
                    ORDER BY category_name, b.title
                """)

                rows = cur.fetchall()
                logger.debug(f"Fetched {len(rows)} raw book records")

                category_wise_books = {}
                for row in rows:
                    try:
                        # Safely access dictionary values
                        category_name = row.get('category_name', 'Uncategorized')
                        book_data = {
                            'book_id': row['book_id'],
                            'title': row['title'],
                            'description': row['description'],
                            'file_url': row['fileUrl'],
                            'audio_url': row['audioUrl'],
                            'cover_url': row['coverUrl'],
                            'is_public': bool(row['is_public']),
                            'is_approved': bool(row['is_approved']),
                            'uploaded_at': row['uploaded_at'].isoformat() if row['uploaded_at'] else None,
                            'uploaded_by_role': row['uploaded_by_role'],
                            'views': row['views'],
                            'author': row['author_name']
                        }

                        if category_name not in category_wise_books:
                            category_wise_books[category_name] = []
                        category_wise_books[category_name].append(book_data)

                    except KeyError as e:
                        logger.error(f"Missing expected column in row: {e}")
                        continue

                logger.info(f"Organized books into {len(category_wise_books)} categories")
                return category_wise_books

        except Exception as e:
            logger.error(f"Error fetching books by category: {str(e)}")
            logger.error(traceback.format_exc())
            return {}
    def close_connection(self):
        try:
            if self.conn and self.conn.is_connected():
                self.conn.close()
                logger.debug("Database connection closed")
        except Exception as e:
            logger.error(f"Error closing database connection: {str(e)}")

