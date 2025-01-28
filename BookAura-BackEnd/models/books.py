import mysql.connector

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
        cur.execute('SELECT * FROM books WHERE book_id = %s', (book_id,))
        book = cur.fetchone()
        cur.close()
        return book

    def create_book(self, author_id, title, description, content, is_public, is_approved):
        cur = self.conn.cursor()
        cur.execute('INSERT INTO books (author_id, title, description, content, is_public, is_approved) VALUES (%s, %s, %s, %s, %s, %s)',
                    (author_id, title, description, content, is_public, is_approved))
        self.conn.commit()
        cur.close()

    def update_book(self, book_id, title, description, content, is_public, is_approved):
        cur = self.conn.cursor()
        cur.execute('UPDATE books SET title = %s, description = %s, content = %s, is_public = %s, is_approved = %s WHERE book_id = %s',
                    (title, description, content, is_public, is_approved, book_id))
        self.conn.commit()
        cur.close()

    def delete_book(self, book_id):
        cur = self.conn.cursor()
        cur.execute('DELETE FROM books WHERE book_id = %s', (book_id,))
        self.conn.commit()
        cur.close()

    def close_connection(self):
        self.conn.close()
