import mysql.connector

class RolesModel:
    def __init__(self):
        self.conn = self.get_db_connection()

    def get_db_connection(self):
        return mysql.connector.connect(
            host="localhost",
            database="bookauradb",
            user="root",
            password="root"
        )

    def fetch_all_roles(self):
        cur = self.conn.cursor()
        cur.execute('SELECT * FROM roles')
        roles = cur.fetchall()
        cur.close()
        return roles

    def fetch_role_by_id(self, role_id):
        cur = self.conn.cursor()
        cur.execute('SELECT * FROM roles WHERE role_id = %s', (role_id,))
        role = cur.fetchone()
        cur.close()
        return role
    
    def fetch_role_by_name(self, role_name):
        cur = self.conn.cursor()
        cur.execute('SELECT * FROM roles WHERE role_name = %s', (role_name,))
        role = cur.fetchone()
        cur.close()
        return role

    def create_role(self, role_name):
        cur = self.conn.cursor()
        cur.execute('INSERT INTO roles (role_name) VALUES (%s)', (role_name,))
        self.conn.commit()
        cur.close()
        
    def is_valid_role(self, role_id):
        cur = self.conn.cursor()
        cur.execute('SELECT COUNT(*) FROM roles WHERE role_id = %s', (role_id,))
        count = cur.fetchone()[0]
        cur.close()
        return count > 0


    def close_connection(self):
        self.conn.close()
