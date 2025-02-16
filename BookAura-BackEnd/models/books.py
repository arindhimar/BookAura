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
                b.book_id  -- Ensure only one row per book
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
        # print("Raw Categories received:", category_ids)  # Debugging

        if isinstance(category_ids, str):  # Fix if received as a string
            try:
                import ast
                category_ids = ast.literal_eval(category_ids)  # Convert to list if it's a string
            except Exception as e:
                # print("Error parsing category_ids:", e)
                category_ids = []

        if not isinstance(category_ids, list):  
            # print("Error: category_ids is not a list. Received:", type(category_ids))
            category_ids = []  # Ensure it's a list

        # print("Processed Categories:", category_ids)  

        cur = self.conn.cursor()

        # Insert the book first
        cur.execute("""
            INSERT INTO books (user_id, title, description, fileUrl, is_public, is_approved, uploaded_by_role) 
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (user_id, title, description, file_url, is_public, is_approved, uploaded_by_role))

        book_id = cur.lastrowid  # Fetch the last inserted book ID
        # print("Inserted book with ID:", book_id)

        # Insert categories only if category_ids is not empty
        if category_ids:
            for category_id in category_ids:
                # print("Category ID:", category_id)
                if isinstance(category_id, (int, str)) and str(category_id).isdigit():  
                    category_id = int(category_id)  # Ensure it's an integer
                    cur.execute("""
                        INSERT INTO book_category (book_id, category_id) VALUES (%s, %s)
                    """, (book_id, category_id))
                    # print(f"Inserted book_category: book_id={book_id}, category_id={category_id}")


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
        

    def get_recommendations(self, user_id, category_ids):
        cur = self.conn.cursor(dictionary=True)
        
        # If category_ids is a list, format it for SQL
        category_placeholders = ', '.join(['%s'] * len(category_ids))  # Creates (%s, %s, %s, ...)
        
        query = f"""
            SELECT DISTINCT 
                b.book_id, 
                b.user_id, 
                b.title, 
                b.description, 
                b.fileUrl, 
                COALESCE(GROUP_CONCAT(c.category_name SEPARATOR ', '), '') AS categories
            FROM books b
            LEFT JOIN book_category bc ON b.book_id = bc.book_id
            LEFT JOIN categories c ON bc.category_id = c.category_id
            WHERE 
                b.user_id = %s 
                OR bc.category_id IN ({category_placeholders})
            GROUP BY b.book_id -- Random selection
            LIMIT 10
        """

        cur.execute(query, [user_id] + category_ids)  
        recommendations = cur.fetchall()
        cur.close()
        return recommendations



    def close_connection(self):
        self.conn.close()
