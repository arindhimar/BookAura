import mysql.connector

class PublishersModel:
    def __init__(self):
        self.conn = self.get_db_connection()

    def get_db_connection(self):
        return mysql.connector.connect(
            host="localhost",
            database="bookauradb",
            user="root",
            password="root"
        )

    def fetch_all_publishers(self):
        cur = self.conn.cursor()
        cur.execute('SELECT * FROM publishers')
        publishers = cur.fetchall()
        cur.close()
        return publishers

    def fetch_publisher_by_id(self, publisher_id):
        cur = self.conn.cursor()
        cur.execute('SELECT * FROM publishers WHERE publisher_id = %s', (publisher_id,))
        publisher = cur.fetchone()
        cur.close()
        return publisher
    
    def fetch_publisher_by_user_id(self, user_id):
        query = "SELECT * FROM publishers WHERE user_id = %s"
        cur = self.conn.cursor()
        cur.execute(query, (user_id,))
        result = cur.fetchone()
        cur.close()
        
        if result:
            # Convert the result to a dictionary
            return {
                'publisher_id': result[0],
                'user_id': result[1],
                'is_flagged': result[2],
                'is_approved': result[3],
            }
        return None    
    
    def fetch_publisher_by_user_id(self, user_id):
        query = "SELECT * FROM publishers WHERE user_id = %s"
        cur = self.conn.cursor()
        cur.execute(query, (user_id,))
        result = cur.fetchone()
        cur.close()
        
        if result:
            return {
                'publisher_id': result[0],
                'user_id': result[1],
                'is_flagged': result[2],
                'is_approved': result[3],
            }
        return None
    
    
    def create_publisher(self, user_id):
        cur = self.conn.cursor()
        cur.execute('INSERT INTO publishers (user_id) VALUES (%s)', (user_id,))
        self.conn.commit()
        cur.close()

    def delete_publisher(self, publisher_id):
        cur = self.conn.cursor()
        cur.execute('DELETE FROM publishers WHERE publisher_id = %s', (publisher_id,))
        self.conn.commit()
        cur.close()
        
    def approve_publisher(self, publisher_id):
        cur = self.conn.cursor()
        cur.execute('UPDATE publishers SET is_approved = 1 WHERE publisher_id = %s', (publisher_id,))
        self.conn.commit()
        cur.close()
        
    def is_approved(self, user_id):
        cur = self.conn.cursor()
        cur.execute('SELECT is_approved FROM publishers WHERE user_id = %s', (user_id,))
        result = cur.fetchone()
        cur.close()
        if result:
            return result[0]
        return None

    def close_connection(self):
        self.conn.close()

