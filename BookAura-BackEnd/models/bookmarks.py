import mysql.connector

#bookmaks(bookmark_id, user_id, book_id, created_at)

class BookmarksModel:
    def __init__(self):
        self.conn = self.get_db_connection()
        
    def get_db_connection(self):
        return mysql.connector.connect(
            host="localhost",
            database="bookauradb",
            user="root",
            password="root"
        )
    
    
    def fetch_all_bookmarks(self):
        cur = self.conn.cursor()
        cur.execute('SELECT * FROM bookmarks')
        bookmarks = cur.fetchall()
        cur.close()
        return bookmarks
    
    def fetch_bookmark_by_id(self, bookmark_id):
        cur = self.conn.cursor()
        cur.execute("""
            SELECT 
                b.bookmark_id, 
                b.user_id, 
                b.book_id, 
                b.created_at
            FROM 
                bookmarks b
            WHERE 
                b.bookmark_id = %s
            """, (bookmark_id,))
        bookmark = cur.fetchone()
        cur.close()
        return bookmark
    
    def fetch_bookmarks_by_user_id(self, user_id):
        cur = self.conn.cursor()
        cur.execute("""
            SELECT 
                b.bookmark_id, 
                b.user_id, 
                b.book_id, 
                b.created_at
            FROM 
                bookmarks b
            WHERE 
                b.user_id = %s
            """, (user_id,))
        bookmarks = cur.fetchall()
        cur.close()
        return bookmarks
    
    def fetch_bookmarks_by_book_id(self, book_id):
        cur = self.conn.cursor()
        cur.execute("""
            SELECT 
                b.bookmark_id, 
                b.user_id, 
                b.book_id, 
                b.created_at
            FROM 
                bookmarks b
            WHERE 
                b.book_id = %s
            """, (book_id,))
        bookmarks = cur.fetchall()
        cur.close()
        return bookmarks
    
    def create_bookmark(self, user_id, book_id):
        cur = self.conn.cursor()
        cur.execute("""
            INSERT INTO bookmarks (user_id, book_id) 
            VALUES (%s, %s)
        """, (user_id, book_id))
        bookmark_id = cur.lastrowid
        self.conn.commit()
        cur.close()
        return bookmark_id
    
    def delete_bookmark(self, bookmark_id):
        cur = self.conn.cursor()
        cur.execute('DELETE FROM bookmarks WHERE bookmark_id = %s', (bookmark_id,))
        self.conn.commit()
        cur.close()
        return True
    
    def delete_bookmarks_by_user_id(self, user_id):
        cur = self.conn.cursor()
        cur.execute('DELETE FROM bookmarks WHERE user_id = %s', (user_id,))
        self.conn.commit()
        cur.close()
        return True
    
    def delete_bookmarks_by_book_id(self, book_id):
        cur = self.conn.cursor()
        cur.execute('DELETE FROM bookmarks WHERE book_id = %s', (book_id,))
        self.conn.commit()
        cur.close()
        return True
    
    def delete_bookmarks_by_user_id_and_book_id(self, user_id, book_id):
        cur = self.conn.cursor()
        cur.execute('DELETE FROM bookmarks WHERE user_id = %s AND book_id = %s', (user_id, book_id))
        self.conn.commit()
        cur.close()
        return True
    
    def fetch_bookmarks_by_book_and_user(self, user_id, book_id):
        cur = self.conn.cursor()
        cur.execute("""
            SELECT 
                b.bookmark_id, 
                b.user_id, 
                b.book_id, 
                b.created_at
            FROM 
                bookmarks b
            WHERE 
                b.user_id = %s AND b.book_id = %s
            """, (user_id, book_id))
        bookmark = cur.fetchone()
        cur.close()
        return bookmark
    
    def delete_bookmark_by_book_and_user(self, user_id, book_id):
        cur = self.conn.cursor()
        cur.execute('DELETE FROM bookmarks WHERE user_id = %s AND book_id = %s', (user_id, book_id))
        self.conn.commit()
        print(cur.statement)
        cur.close()
        return True
    
    def add_bookmark(self, user_id, book_id):
        cur = self.conn.cursor()
        cur.execute("""
            INSERT INTO bookmarks (user_id, book_id) 
            VALUES (%s, %s)
        """, (user_id, book_id))
        bookmark_id = cur.lastrowid
        self.conn.commit()
        cur.close()
        return bookmark_id
        
    def fetch_bookmarks_by_user(self, user_id):
        cur = self.conn.cursor()
        cur.execute("""
            SELECT 
                b.bookmark_id, 
                b.user_id, 
                b.book_id, 
                b.created_at
            FROM 
                bookmarks b
            WHERE 
                b.user_id = %s
            """, (user_id,))
        bookmarks = cur.fetchall()
        print(cur.statement)
        cur.close()
        return bookmarks
    
    def close_connection(self):
        self.conn.close()
        return True
        