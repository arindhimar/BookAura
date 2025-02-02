import mysql.connector

class ModeratorsModel:
    def __init__(self):
        self.conn = self.get_db_connection()

    def get_db_connection(self):
        return mysql.connector.connect(
            host="localhost",
            database="bookauradb",
            user="root",
            password="root"
        )

    def fetch_all_moderators(self):
        cur = self.conn.cursor()
        cur.execute('SELECT * FROM moderators')
        moderators = cur.fetchall()
        cur.close()
        return moderators

    def fetch_moderator_by_id(self, moderator_id):
        cur = self.conn.cursor()
        cur.execute('SELECT * FROM moderators WHERE moderator_id = %s', (moderator_id,))
        moderator = cur.fetchone()
        cur.close()
        return moderator

    def create_moderator(self, user_id):
        cur = self.conn.cursor()
        cur.execute('INSERT INTO moderators (user_id) VALUES (%s)', (user_id,))
        self.conn.commit()
        cur.close()

    def delete_moderator(self, moderator_id):
        cur = self.conn.cursor()
        cur.execute('DELETE FROM moderators WHERE moderator_id = %s', (moderator_id,))
        self.conn.commit()
        cur.close()

    def close_connection(self):
        self.conn.close()
