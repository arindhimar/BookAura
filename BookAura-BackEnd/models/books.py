import mysql.connector
import random
import ast
import json

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
        with self.conn.cursor(dictionary=True) as cur:
            cur.execute("""
                SELECT 
                    b.book_id, 
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
                    books b
                LEFT JOIN 
                    book_category bc ON b.book_id = bc.book_id
                LEFT JOIN 
                    categories c ON bc.category_id = c.category_id
                LEFT JOIN 
                    users u ON b.user_id = u.user_id
                LEFT JOIN 
                    views v ON b.book_id = v.book_id  -- Join the views table
                GROUP BY 
                    b.book_id, b.user_id, u.username, b.title, b.description, b.fileUrl, b.audioUrl, 
                    b.is_public, b.is_approved, b.uploaded_at, b.uploaded_by_role, v.book_view
            """)
            books = cur.fetchall()
            return books


    def fetch_book_by_id(self, book_id):
        with self.conn.cursor(dictionary=True) as cur:
            # Fetch the main book details with author name
            cur.execute("""
                SELECT 
                    b.book_id, 
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
                    COALESCE(GROUP_CONCAT(c.category_name SEPARATOR ', '), '') AS categories
                FROM 
                    books b
                LEFT JOIN 
                    book_category bc ON b.book_id = bc.book_id
                LEFT JOIN 
                    categories c ON bc.category_id = c.category_id
                LEFT JOIN 
                    users u ON b.user_id = u.user_id
                WHERE 
                    b.book_id = %s
                GROUP BY 
                    b.book_id
            """, (book_id,))
            
            book = cur.fetchone()
            return book

    def fetch_public_books(self):
        with self.conn.cursor(dictionary=True) as cur:
            cur.execute("""
                SELECT 
                    b.book_id, 
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
                    COALESCE(GROUP_CONCAT(c.category_name SEPARATOR ', '), '') AS categories,
                    v.book_view AS views  -- Include book views
                FROM 
                    books b
                LEFT JOIN 
                    book_category bc ON b.book_id = bc.book_id
                LEFT JOIN 
                    categories c ON bc.category_id = c.category_id
                LEFT JOIN 
                    users u ON b.user_id = u.user_id
                LEFT JOIN 
                    views v ON b.book_id = v.book_id  -- Join the views table
                WHERE 
                    b.is_public = 1
                GROUP BY 
                    b.book_id, b.user_id, u.username, b.title, b.description, b.fileUrl, b.audioUrl, 
                    b.is_public, b.is_approved, b.uploaded_at, b.uploaded_by_role, v.book_view
            """)
            books = cur.fetchall()
            return books

    # def create_book(self, user_id, title, file_url, description, is_public, is_approved, uploaded_by_role, category_ids):
    #     if isinstance(category_ids, str):  
    #         try:
    #             import ast
    #             category_ids = ast.literal_eval(category_ids) 
    #         except Exception as e:
    #             category_ids = []

    #     if not isinstance(category_ids, list):  
    #         category_ids = []  

    #     cur = self.conn.cursor()

    #     cur.execute("""
    #         INSERT INTO books (user_id, title, description, fileUrl, is_public, is_approved, uploaded_by_role) 
    #         VALUES (%s, %s, %s, %s, %s, %s, %s)
    #     """, (user_id, title, description, file_url, is_public, is_approved, uploaded_by_role))

    #     book_id = cur.lastrowid  
        
    #     cur.execute('INSERT INTO views(book_id,book_view) VALUES(%s,%s)',(book_id,0))
        
        
    #     if category_ids:
    #         for category_id in category_ids:
    #             if isinstance(category_id, (int, str)) and str(category_id).isdigit():  
    #                 category_id = int(category_id)  
    #                 cur.execute("""
    #                     INSERT INTO book_category (book_id, category_id) VALUES (%s, %s)
    #                 """, (book_id, category_id))
    #     self.conn.commit()
    #     cur.close()



    def create_book(self, user_id, title, description, file_url, audio_url, is_public, is_approved, uploaded_by_role, category_ids, cover_url=""):
            try:
                # Convert category_ids to list if needed
                if isinstance(category_ids, str):
                    category_ids = json.loads(category_ids)
                
                with self.conn.cursor() as cur:
                    # Insert book with all fields
                    cur.execute("""
                        INSERT INTO books 
                        (user_id, title, description, fileUrl, audioUrl, is_public, is_approved, uploaded_by_role, coverUrl) 
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, (
                        user_id, 
                        title, 
                        description, 
                        file_url, 
                        audio_url or "", 
                        is_public, 
                        is_approved, 
                        uploaded_by_role,
                        cover_url or "/default-cover.png"
                    ))

                    book_id = cur.lastrowid
                    cur.execute('INSERT INTO views (book_id, book_view) VALUES (%s, %s)', (book_id, 0))

                    # Insert categories safely
                    if category_ids and isinstance(category_ids, list):
                        for category_id in category_ids:
                            try:
                                cur.execute("""
                                    INSERT INTO book_category (book_id, category_id)
                                    VALUES (%s, %s)
                                """, (book_id, int(category_id)))
                            except ValueError:
                                continue

                    self.conn.commit()
                    return book_id

            except Exception as e:
                self.conn.rollback()
                print(f"Database Error: {e}")
                raise
            
    def update_book(self, book_id,title, description, is_public, is_approved):
        cur = self.conn.cursor()
        cur.execute('UPDATE books SET title = %s, description = %s, is_public = %s, is_approved = %s WHERE book_id = %s',
                    (title, description, is_public, is_approved, book_id))
        self.conn.commit()
        cur.close()

    def delete_book(self, book_id):
        try:
            cur = self.conn.cursor()
            
            cur.execute("SET FOREIGN_KEY_CHECKS = 0")
            
            tables = [
                'book_category',
                'views',
                'bookmarks',
                'audio_requests',
                'reading_history',
                'reports'
            ]
            
            for table in tables:
                cur.execute(f'DELETE FROM {table} WHERE book_id = %s', (book_id,))
            
            cur.execute('DELETE FROM books WHERE book_id = %s', (book_id,))
            
            cur.execute("SET FOREIGN_KEY_CHECKS = 1")
            
            self.conn.commit()
            return True
        except Exception as e:
            self.conn.rollback()
            print(f"Error deleting book: {e}")
            return False
        finally:
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
        with self.conn.cursor(dictionary=True) as cur:
            cur.execute("""
                SELECT 
                    b.book_id, 
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
                    COALESCE(GROUP_CONCAT(c.category_name SEPARATOR ', '), '') AS categories,
                    v.book_view AS views  -- Include book views
                FROM 
                    books b
                LEFT JOIN 
                    book_category bc ON b.book_id = bc.book_id
                LEFT JOIN 
                    categories c ON bc.category_id = c.category_id
                LEFT JOIN 
                    users u ON b.user_id = u.user_id
                LEFT JOIN 
                    views v ON b.book_id = v.book_id  -- Join the views table
                WHERE 
                    b.title LIKE %s
                GROUP BY 
                    b.book_id, b.user_id, u.username, b.title, b.description, b.fileUrl, b.audioUrl, 
                    b.is_public, b.is_approved, b.uploaded_at, b.uploaded_by_role, v.book_view
            """, (f'%{query}%',))
            books = cur.fetchall()
            return books
        
        
    def fetch_books_by_category(self, category_id):
        with self.conn.cursor(dictionary=True) as cur:
            cur.execute("""
                SELECT 
                    b.book_id, 
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
                    COALESCE(GROUP_CONCAT(c.category_name SEPARATOR ', '), '') AS categories,
                    v.book_view AS views  -- Include book views
                FROM 
                    books b
                LEFT JOIN 
                    book_category bc ON b.book_id = bc.book_id
                LEFT JOIN 
                    categories c ON bc.category_id = c.category_id
                LEFT JOIN 
                    users u ON b.user_id = u.user_id
                LEFT JOIN 
                    views v ON b.book_id = v.book_id  -- Join the views table
                WHERE 
                    bc.category_id = %s
                GROUP BY 
                    b.book_id, b.user_id, u.username, b.title, b.description, b.fileUrl, b.audioUrl, 
                    b.is_public, b.is_approved, b.uploaded_at, b.uploaded_by_role, v.book_view
            """, (category_id,))
            books = cur.fetchall()
            return books
    
    def fetch_complete_book(self, book_id):
        """Fetches a book along with related books based on categories and author."""
        with self.conn.cursor(dictionary=True) as cur:
            # Fetch the main book details
            cur.execute("""
                SELECT 
                    b.book_id, 
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
                    COALESCE(GROUP_CONCAT(c.category_name SEPARATOR ', '), '') AS categories
                FROM 
                    books b
                LEFT JOIN 
                    book_category bc ON b.book_id = bc.book_id
                LEFT JOIN 
                    categories c ON bc.category_id = c.category_id
                LEFT JOIN 
                    users u ON b.user_id = u.user_id
                WHERE 
                    b.book_id = %s
                GROUP BY 
                    b.book_id
            """, (book_id,))
            
            book = cur.fetchone()
            
            if not book:
                return None  # Book not found

            category_names = book['categories'].split(', ') if book['categories'] else []

            # Fetch related books by categories
            if category_names:
                placeholders = ', '.join(['%s'] * len(category_names))
                cur.execute(f"""
                    SELECT DISTINCT 
                        b.book_id, 
                        b.title, 
                        b.fileUrl,
                        u.username AS author_name  -- Include author name
                    FROM books b
                    LEFT JOIN book_category bc ON b.book_id = bc.book_id
                    LEFT JOIN categories c ON bc.category_id = c.category_id
                    LEFT JOIN users u ON b.user_id = u.user_id  -- Join users table
                    WHERE c.category_name IN ({placeholders}) 
                        AND b.book_id != %s  -- Exclude current book
                    LIMIT 5;
                """, tuple(category_names) + (book_id,))
                related_books_by_category = cur.fetchall()
            else:
                related_books_by_category = []

            # Fetch related books by the same author
            cur.execute("""
                SELECT 
                    b.book_id, 
                    b.title, 
                    b.fileUrl,
                    u.username AS author_name  -- Include author name
                FROM books b
                LEFT JOIN users u ON b.user_id = u.user_id  -- Join users table
                WHERE b.user_id = %s 
                    AND b.book_id != %s  
                LIMIT 5;
            """, (book['author_id'], book_id))
            related_books_by_author = cur.fetchall()

        return {
            "book": book,
            "related_books_by_category": related_books_by_category,
            "related_books_by_author": related_books_by_author
        }
    
    def fetch_books_by_publisher(self, publisher_id):
        with self.conn.cursor(dictionary=True) as cur:
            cur.execute("""
                SELECT 
                    b.book_id, 
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
                    COALESCE(GROUP_CONCAT(DISTINCT c.category_name SEPARATOR ', '), '') AS categories,
                    COALESCE(SUM(v.book_view), 0) AS views  -- Aggregate book views
                FROM 
                    books b
                LEFT JOIN 
                    book_category bc ON b.book_id = bc.book_id
                LEFT JOIN 
                    categories c ON bc.category_id = c.category_id
                LEFT JOIN 
                    users u ON b.user_id = u.user_id
                LEFT JOIN 
                    views v ON b.book_id = v.book_id  -- Join the views table
                WHERE 
                    b.user_id = %s
                GROUP BY 
                    b.book_id, u.username, b.title, b.description, b.fileUrl, 
                    b.audioUrl, b.is_public, b.is_approved, b.uploaded_at, 
                    b.uploaded_by_role
            """, (publisher_id,))
            books = cur.fetchall()
            return books
    
    def close_connection(self):
        self.conn.close()
