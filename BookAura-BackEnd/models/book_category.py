import mysql.connector


class BookCategoriesModel:
    def __init__(self):
        self.conn = self.get_db_connection()
    
    def get_db_connection(self):
        return mysql.connector.connect(
            host="localhost",
            database="bookauradb",
            user="root",
            password="root"
        )
    
    def fetch_all_book_categories(self):
        cur = self.conn.cursor()
        cur.execute('SELECT * FROM book_categories')
        book_categories = cur.fetchall()
        cur.close()
        return book_categories
    
    def fetch_book_category_by_id(self, book_category_id):
        cur = self.conn.cursor()
        cur.execute('SELECT * FROM book_categories WHERE book_category_id = %s', (book_category_id,))
        book_category = cur.fetchone()
        cur.close()
        return book_category
    
    def create_book_category(self,book_id,category_id):
        cur = self.conn.cursor()
        cur.execute('INSERT INTO book_categories (book_id,category_id) VALUES (%s,%s)', (book_id,category_id))
        self.conn.commit()
        cur.close()
    
    def delete_book_category(self, book_category_id):
        cur = self.conn.cursor()
        cur.execute('DELETE FROM book_categories WHERE book_category_id = %s', (book_category_id,))
        self.conn.commit()
        cur.close()
        
    def close_connection(self):
        self.conn.close()
    
    