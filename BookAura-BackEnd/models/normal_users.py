import mysql.connector

class NormalUsersModel:
    def __init__(self):
        self.conn = self.get_db_connection()

    def get_db_connection(self):
        return mysql.connector.connect(
            host="localhost",
            database="bookauradb",
            user="root",
            password="root"
        )

    def fetch_all_normal_users(self):
        cur = self.conn.cursor()
        cur.execute('SELECT * FROM normal_users')
        normal_users = cur.fetchall()
        cur.close()
        return normal_users

    def fetch_normal_user_by_id(self, normal_user_id):
        cur = self.conn.cursor()
        cur.execute('SELECT * FROM normal_users WHERE normal_user_id = %s', (normal_user_id,))
        normal_user = cur.fetchone()
        cur.close()
        return normal_user

    def create_normal_user(self, user_id, additional_info):
        cur = self.conn.cursor()
        cur.execute('INSERT INTO normal_users (user_id, additional_info) VALUES (%s, %s)', (user_id, additional_info))
        self.conn.commit()
        cur.close()

    def update_normal_user(self, normal_user_id, additional_info):
        cur = self.conn.cursor()
        cur.execute('UPDATE normal_users SET additional_info = %s WHERE normal_user_id = %s', (additional_info, normal_user_id))
        self.conn.commit()
        cur.close()

    def delete_normal_user(self, normal_user_id):
        cur = self.conn.cursor()
        cur.execute('DELETE FROM normal_users WHERE normal_user_id = %s', (normal_user_id,))
        self.conn.commit()
        cur.close()

    def close_connection(self):
        self.conn.close()
