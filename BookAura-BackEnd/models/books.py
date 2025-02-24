import mysql.connector
import random


class BooksModel:
    def __init__(self):
        self.conn = self.get_db_connection()

    def get_db_connection(self):
        return mysql.connector.connect(
            host="localhost",
            database="bookauradb",
            user="root",
            password="root"
        )

    def fetch_all_books(self):
        cur = self.conn.cursor()
        cur.execute('SELECT * FROM books')
        books = cur.fetchall()
        cur.close()
        return books

    def fetch_book_by_id(self, book_id):
        cur = self.conn.cursor()
        cur.execute("""
            SELECT 
                b.book_id, 
                b.user_id, 
                b.title, 
                b.description, 
                b.fileUrl, 
                b.is_public, 
                b.is_approved, 
                b.uploaded_at, 
                b.uploaded_by_role,
                COALESCE(GROUP_CONCAT(c.category_name SEPARATOR ', '), '') AS categories  -- Aggregate categories into a single string
            FROM 
                books b
            LEFT JOIN 
                book_category bc ON b.book_id = bc.book_id
            LEFT JOIN 
                categories c ON bc.category_id = c.category_id
            WHERE 
                b.book_id = %s
            GROUP BY 
                b.book_id  
            """, (book_id,))
        
        book = cur.fetchone()
        cur.close()
        return book

    def fetch_public_books(self):
        cur = self.conn.cursor()
        cur.execute('SELECT * FROM books WHERE is_public = 1')
        books = cur.fetchall()
        cur.close()
        return books

    def create_book(self, user_id, title, file_url, description, is_public, is_approved, uploaded_by_role, category_ids):
        if isinstance(category_ids, str):  
            try:
                import ast
                category_ids = ast.literal_eval(category_ids) 
            except Exception as e:
                category_ids = []

        if not isinstance(category_ids, list):  
            category_ids = []  

        cur = self.conn.cursor()

        cur.execute("""
            INSERT INTO books (user_id, title, description, fileUrl, is_public, is_approved, uploaded_by_role) 
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (user_id, title, description, file_url, is_public, is_approved, uploaded_by_role))

        book_id = cur.lastrowid  
        
        cur.execute('INSERT INTO views(book_id,book_view) VALUES(%s,%s)',(book_id,0))
        
        
        if category_ids:
            for category_id in category_ids:
                if isinstance(category_id, (int, str)) and str(category_id).isdigit():  
                    category_id = int(category_id)  
                    cur.execute("""
                        INSERT INTO book_category (book_id, category_id) VALUES (%s, %s)
                    """, (book_id, category_id))
        self.conn.commit()
        cur.close()


    def update_book(self, book_id,title, description, is_public, is_approved):
        cur = self.conn.cursor()
        cur.execute('UPDATE books SET title = %s, description = %s, is_public = %s, is_approved = %s WHERE book_id = %s',
                    (title, description, is_public, is_approved, book_id))
        self.conn.commit()
        cur.close()

    def delete_book(self, book_id):
        cur = self.conn.cursor()
        cur.execute('DELETE FROM books WHERE book_id = %s', (book_id,))
        self.conn.commit()
        cur.close()
        
    def fetch_unread_books_by_user(self, user_id):
        """Fetch books that the user has not read yet."""
        query = """
        SELECT b.* FROM books b
        WHERE b.book_id NOT IN (
            SELECT book_id FROM user_reads WHERE user_id = %s
        )"""
        cur = self.conn.cursor()
        cur.execute(query, (user_id,))
        return self.cursor.fetchall()

    def fetch_unread_books_by_user_and_category(self, user_id, category_names):
        cur = self.conn.cursor(dictionary=True)

        if not category_names:
            return []

        category_placeholders = ', '.join(['%s'] * len(category_names))
        cur.execute(f"SELECT category_id FROM categories WHERE category_name IN ({category_placeholders})", tuple(category_names))
        category_ids = [row['category_id'] for row in cur.fetchall()]

        if not category_ids:
            return []

        # Fetch books with author names and categories
        category_id_placeholders = ', '.join(['%s'] * len(category_ids))
        query = f"""
            SELECT DISTINCT 
                b.book_id, 
                b.user_id AS author_id, 
                u.username AS author_name, 
                b.title, 
                b.description, 
                b.fileUrl, 
                b.uploaded_by_role,
                COALESCE(GROUP_CONCAT(c.category_name SEPARATOR ', '), '') AS categories  -- Fetching categories
            FROM books b
            LEFT JOIN book_category bc ON b.book_id = bc.book_id
            LEFT JOIN categories c ON bc.category_id = c.category_id
            LEFT JOIN users u ON b.user_id = u.user_id  
            WHERE bc.category_id IN ({category_id_placeholders})
            GROUP BY b.book_id, u.username  
            LIMIT 5;
        """
        
        cur.execute(query, tuple(category_ids))
        return cur.fetchall()



    
    def fetch_unread_books(self, user_id):
        """Fetch books that the user has not read yet."""
        query = """
        SELECT * from books;
        """
        self.cursor.execute(query, (user_id,))
        return self.cursor.fetchall()
    
    def fetch_book_author(self, book_id):
        with self.conn.cursor() as cur:
            cur.execute(
                """SELECT u.username 
                FROM books b 
                JOIN users u ON b.user_id = u.user_id 
                WHERE b.book_id = %s""",
                (book_id,)
            )
            result = cur.fetchone()
        return result[0] if result else None
    
    def search_books(self, query):
        cur = self.conn.cursor()
        cur.execute(
            """
            SELECT 
                b.book_id, 
                b.user_id, 
                b.title, 
                b.description, 
                b.fileUrl, 
                b.is_public, 
                b.is_approved, 
                b.uploaded_at, 
                b.uploaded_by_role,
                COALESCE(GROUP_CONCAT(c.category_name SEPARATOR ', '), '') AS categories
            FROM 
                books b
            LEFT JOIN 
                book_category bc ON b.book_id = bc.book_id
            LEFT JOIN 
                categories c ON bc.category_id = c.category_id
            WHERE 
                b.title LIKE %s
            GROUP BY 
                b.book_id
            """,
            (f'%{query}%',)
        )
        books = cur.fetchall()
        cur.close()
        return books
    
    def fetch_books_by_category(self, category_id):
        cur = self.conn.cursor(dictionary=True)
        
        while cur.nextset():
            cur.fetchall()
        
        query = """
            SELECT DISTINCT 
                b.book_id, 
                b.user_id AS author_id, 
                u.username AS author_name, 
                b.title, 
                b.description, 
                b.fileUrl, 
                b.uploaded_by_role,
                GROUP_CONCAT(c.category_name SEPARATOR ', ') AS categories
            FROM books b
            LEFT JOIN book_category bc ON b.book_id = bc.book_id
            LEFT JOIN categories c ON bc.category_id = c.category_id
            LEFT JOIN users u ON b.user_id = u.user_id
            WHERE bc.category_id = %s
            GROUP BY b.book_id
            LIMIT 5;
        """

        cur.execute(query, (category_id,))
        #printexecuted query
        # print(cur.statement)
        books = cur.fetchall()

        cur.close()  
        return books


        


    def close_connection(self):
        self.conn.close()
