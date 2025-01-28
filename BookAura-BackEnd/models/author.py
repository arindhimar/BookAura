import mysql.connector

class AuthorsModel:
    def __init__(self):
        self.conn = self.get_db_connection()

    def get_db_connection(self):
        return mysql.connector.connect(
            host="localhost",
            database="bookauradb",
            user="root",
            password="root"
        )

    def fetch_all_authors(self):
        cur = self.conn.cursor()
        cur.execute('SELECT * FROM authors')
        authors = cur.fetchall()
        cur.close()
        return authors

    def fetch_author_by_id(self, author_id):
        cur = self.conn.cursor()
        cur.execute('SELECT * FROM authors WHERE author_id = %s', (author_id,))
        author = cur.fetchone()
        cur.close()
        return author

    def create_author(self, user_id, bio=None):
        cur = self.conn.cursor()
        cur.execute('INSERT INTO authors (user_id, bio) VALUES (%s, %s)', (user_id, bio))
        self.conn.commit()
        cur.close()

    def delete_author(self, author_id):
        cur = self.conn.cursor()
        cur.execute('DELETE FROM authors WHERE author_id = %s', (author_id,))
        self.conn.commit()
        cur.close()

    def close_connection(self):
        self.conn.close()


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
        users = cur.fetchall()
        cur.close()
        return users

    def fetch_normal_user_by_id(self, normal_user_id):
        cur = self.conn.cursor()
        cur.execute('SELECT * FROM normal_users WHERE normal_user_id = %s', (normal_user_id,))
        user = cur.fetchone()
        cur.close()
        return user

    def create_normal_user(self, user_id, additional_info=None):
        cur = self.conn.cursor()
        cur.execute('INSERT INTO normal_users (user_id, additional_info) VALUES (%s, %s)', (user_id, additional_info))
        self.conn.commit()
        cur.close()

    def delete_normal_user(self, normal_user_id):
        cur = self.conn.cursor()
        cur.execute('DELETE FROM normal_users WHERE normal_user_id = %s', (normal_user_id,))
        self.conn.commit()
        cur.close()

    def close_connection(self):
        self.conn.close()