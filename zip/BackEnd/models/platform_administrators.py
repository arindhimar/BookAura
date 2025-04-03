import mysql.connector

class PlatformAdministratorsModel:
    def __init__(self):
        self.conn = self.get_db_connection()

    def get_db_connection(self):
        print("Connecting to database")
        return mysql.connector.connect(
            host="localhost",
            database="bookauradb",
            user="root",
            password="root"
        )

    def fetch_all_platform_administrators(self):
        cur = self.conn.cursor()
        cur.execute('SELECT * FROM platform_administrators')
        admins = cur.fetchall()
        cur.close()
        return admins

    def fetch_platform_administrator_by_id(self, admin_id):
        cur = self.conn.cursor()
        cur.execute('SELECT * FROM platform_administrators WHERE admin_id = %s', (admin_id,))
        admin = cur.fetchone()
        cur.close()
        return admin

    def create_platform_administrator(self, user_id):
        cur = self.conn.cursor()
        cur.execute('INSERT INTO platform_administrators (user_id) VALUES (%s)', (user_id,))
        self.conn.commit()
        cur.close()

    def delete_platform_administrator(self, admin_id):
        cur = self.conn.cursor()
        cur.execute('DELETE FROM platform_administrators WHERE admin_id = %s', (admin_id,))
        self.conn.commit()
        cur.close()

    def close_connection(self):
        self.conn.close()
