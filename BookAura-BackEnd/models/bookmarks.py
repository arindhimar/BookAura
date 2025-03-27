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
        with self.conn.cursor(dictionary=True) as cur:
            cur.execute("""
                SELECT 
                    bm.bookmark_id,
                    bm.user_id,
                    bm.book_id,
                    bm.created_at,
                    b.book_id AS book_book_id, 
                    b.user_id AS author_id, 
                    u.username AS author_name, 
                    b.title, 
                    b.description, 
                    b.coverUrl, 
                    b.fileUrl, 
                    b.audioUrl,
                    b.is_public, 
                    b.is_approved, 
                    b.uploaded_at, 
                    b.coverUrl,
                    b.uploaded_by_role,
                    COALESCE(GROUP_CONCAT(c.category_name SEPARATOR ', '), '') AS categories,
                    COALESCE(v.book_view, 0) AS views  -- Include book views
                FROM 
                    bookmarks bm
                LEFT JOIN 
                    books b ON bm.book_id = b.book_id
                LEFT JOIN 
                    book_category bc ON b.book_id = bc.book_id
                LEFT JOIN 
                    categories c ON bc.category_id = c.category_id
                LEFT JOIN 
                    users u ON b.user_id = u.user_id  -- Join with users table to get author_name
                LEFT JOIN 
                    views v ON b.book_id = v.book_id  -- Join the views table
                WHERE 
                    bm.user_id = %s
                GROUP BY 
                    bm.bookmark_id, bm.user_id, bm.book_id, bm.created_at, 
                    b.book_id, b.user_id, u.username, b.title, b.description, b.coverUrl, b.fileUrl, b.audioUrl, 
                    b.is_public, b.is_approved, b.uploaded_at, b.uploaded_by_role, v.book_view
            """, (user_id,))
            bookmarks = cur.fetchall()
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
        cur.close()
        return bookmarks
    
    def close_connection(self):
        self.conn.close()
        return True
        