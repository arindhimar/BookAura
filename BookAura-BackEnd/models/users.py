import mysql.connector

class UsersModel:
    def __init__(self):
        self.conn = self.get_db_connection()

    def get_db_connection(self):
        return mysql.connector.connect(
            host="localhost",
            database="bookauradb",
            user="root",
            password="root"
        )

    def fetch_all_users(self):
        cur = self.conn.cursor(dictionary=True)  # Use dictionary=True for key-value results
        cur.execute('SELECT * FROM users')
        users = cur.fetchall()
        cur.close()
        return users

    def fetch_user_by_id(self, user_id):
        cur = self.conn.cursor(dictionary=True)  # Use dictionary=True for key-value results
        cur.execute('SELECT user_id,username,role_id,email FROM users WHERE user_id = %s', (user_id,))
        user = cur.fetchone()
        cur.close()
        return user

    def create_user(self, username, email, password_hash, role_id):
        cur = self.conn.cursor()
        query = 'INSERT INTO users (username, email, password_hash, role_id) VALUES (%s, %s, %s, %s)'
        cur.execute(query, (username, email, password_hash, role_id))
        self.conn.commit()
        user_id = cur.lastrowid
        cur.close()
        return user_id

    def update_user(self, user_id, username, email, password_hash, role_id):
        cur = self.conn.cursor()
        cur.execute(
            'UPDATE users SET username = %s, email = %s, password_hash = %s, role_id = %s WHERE user_id = %s',
            (username, email, password_hash, role_id, user_id)
        )
        self.conn.commit()
        cur.close()

    def delete_user(self, user_id):
        cur = self.conn.cursor()
        cur.execute('DELETE FROM users WHERE user_id = %s', (user_id,))
        self.conn.commit()
        cur.close()

    def add_platform_administrator_data(self, user_id):
        cur = self.conn.cursor()
        query = "INSERT INTO platform_administrators(user_id) VALUES (%s)"
        cur.execute(query, (user_id,))
        self.conn.commit()
        cur.close()

    def fetch_user_by_email(self, email):
        cur = self.conn.cursor(dictionary=True)  
        query = "SELECT user_id, username, email, password_hash, role_id FROM users WHERE email = %s"
        cur.execute(query, (email,))
        user = cur.fetchone()
        cur.close()
        return user

    def fetch_password_hash(self, email):
        cur = self.conn.cursor(dictionary=True)
        query = "SELECT password_hash FROM users WHERE email = %s"
        cur.execute(query, (email,))
        password_hash = cur.fetchone()
        cur.close()
        return password_hash

    def update_password(self, user_id, password_hash):
        cur = self.conn.cursor()
        query = "UPDATE users SET password_hash = %s WHERE user_id = %s"
        cur.execute(query, (password_hash, user_id))
        self.conn.commit()
        cur.close()
    
    def close_connection(self):
        self.conn.close()
