import mysql.connector

class ReadingHistoryModel:
    def __init__(self):
        self.conn = self.get_db_connection()
        
    def get_db_connection(self):
        return mysql.connector.connect(
            host="localhost",
            database="bookauradb",
            user="root",
            password="root"
        )
        
    def fetch_all_reading_history(self):
        cur = self.conn.cursor()
        cur.execute('SELECT * FROM reading_history')
        reading_history = cur.fetchall()
        cur.close()
        return reading_history

    def fetch_reading_history_by_id(self, history_id):
        cur = self.conn.cursor()
        cur.execute("""
            SELECT 
                rh.history_id, 
                rh.user_id, 
                rh.book_id, 
                rh.last_read_at
            FROM 
                reading_history rh
            WHERE 
                rh.history_id = %s
            """, (history_id,))
        reading_history = cur.fetchone()
        cur.close()
        return reading_history
    
    def fetch_reading_history_by_user_id(self, user_id):
        cur = self.conn.cursor()
        cur.execute("""
            SELECT 
                rh.history_id, 
                rh.user_id, 
                rh.book_id, 
                rh.last_read_at
            FROM 
                reading_history rh
            WHERE 
                rh.user_id = %s
            """, (user_id,))
        reading_history = cur.fetchall()
        cur.close()
        return reading_history
    
    def create_reading_history(self, user_id, book_id):
        cur = self.conn.cursor()
        cur.execute("""
            INSERT INTO reading_history (user_id, book_id) 
            VALUES (%s, %s)
            """, (user_id, book_id))
        self.conn.commit()
        cur.close()
        
    def fetch_reading_history_by_user_and_book(self, user_id, book_id):
        cur = self.conn.cursor()
        cur.execute("""
            SELECT 
                rh.history_id, 
                rh.user_id, 
                rh.book_id, 
                rh.last_read_at
            FROM 
                reading_history rh
            WHERE 
                rh.user_id = %s
            AND
                rh.book_id = %s
            """, (user_id, book_id))
        reading_history = cur.fetchone()
        cur.close()
        return reading_history
    
    def close_connection(self):
        self.conn.close()