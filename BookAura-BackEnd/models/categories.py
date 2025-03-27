import mysql.connector

class CategoriesModel:
    def __init__(self):
        self.conn=self.get_db_connection()
        
    
    def get_db_connection(self):
        return mysql.connector.connect(
            host="localhost",
            database="bookauradb",
            user="root",
            password="root"
        )
    
    def fetch_all_categories(self):
        cur = self.conn.cursor()
        cur.execute('SELECT * FROM categories')
        categories = cur.fetchall()
        cur.close()
        return categories
    
    def fetch_category_by_id(self, category_id):
        cur = self.conn.cursor()
        cur.execute('SELECT * FROM categories WHERE category_id = %s', (category_id,))
        category = cur.fetchone()
        cur.close()
        return category
    
    def fetch_category_by_name(self, category_name):
        cur = self.conn.cursor()
        cur.execute('SELECT * FROM categories WHERE category_name = %s', (category_name,))
        category = cur.fetchone()
        cur.close()
        return category
    
    def create_category(self, category_name):
        cur = self.conn.cursor()
        cur.execute('INSERT INTO categories (category_name) VALUES (%s)', (category_name,))
        self.conn.commit()
        cur.close()
        
    def update_category(self, category_id, category_name):
        cur = self.conn.cursor()
        cur.execute('UPDATE categories SET category_name = %s WHERE category_id = %s', (category_name, category_id))
        self.conn.commit()
        cur.close()
    
    def delete_category(self, category_id):
        cur = self.conn.cursor()
        cur.execute('DELETE FROM categories WHERE category_id = %s', (category_id,))
        self.conn.commit()
        cur.close()
        
    def fetch_books_category_wise(self):
        cur = self.conn.cursor()
        # Query to fetch all books with their categories
        cur.execute("""
            SELECT 
                c.category_name,
                b.book_id, 
                b.user_id, 
                b.title, 
                b.description, 
                b.fileUrl,
                b.audioUrl,  -- New column
                b.is_public, 
                b.is_approved, 
                b.uploaded_at, 
                b.coverUrl,  -- New column
                b.uploaded_by_role
            FROM books b
            LEFT JOIN book_category bc ON b.book_id = bc.book_id
            LEFT JOIN categories c ON bc.category_id = c.category_id
            ORDER BY c.category_name, b.title
        """)
        rows = cur.fetchall()
        cur.close()

        # Organize books by category
        category_wise_books = {}
        for row in rows:
            category_name = row[0] if row[0] else "Uncategorized"  # Handle books without categories
            book_data = {
                'book_id': row[1],
                'user_id': row[2],
                'title': row[3],
                'description': row[4],
                'fileUrl': row[5],
                'audioUrl': row[6],
                'is_public': row[7],
                'is_approved': row[8],
                'uploaded_at': row[9],
                'uploaded_by_role': row[11],
                'cover_url': row[10]
            }

            if category_name not in category_wise_books:
                category_wise_books[category_name] = []
            category_wise_books[category_name].append(book_data)

        return category_wise_books
        
    def close_connection(self):
        self.conn.close()
        
            
    
    
    