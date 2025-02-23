import mysql.connector

class BooksViewsModel:
    def __init__(self):
        self.conn = self.get_db_connection()
        
    def get_db_connection(self):
        return mysql.connector.connect(
            host="localhost",
            database="bookauradb",
            user="root",
            password="root"
        )
        
    def fetch_all_books_views(self):
        cur = self.conn.cursor()
        cur.execute('SELECT * FROM views')
        books = cur.fetchall()
        cur.close()
        return books
    
    def fetch_book_views_by_id(self, book_id):
        cur = self.conn.cursor()
        cur.execute("""
            SELECT 
                v.book_id, 
                v.book_view, 
            FROM 
                views v
            WHERE 
                v.book_id = %s
            """, (book_id,))
        book = cur.fetchone()
        cur.close()
        return book
    
    def add_view(self,book_id):
        cur = self.conn.cursor()
        cur.execute("UPDATE views SET book_view = book_view + 1 WHERE book_id = %s",(book_id,))
        self.conn.commit()
        cur.close()
        return True
    
    
        
    
    