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
    
    def count_users_by_role(self, role_id):
        query = "SELECT COUNT(*) as count FROM users WHERE role_id = %s"
        self.cursor.execute(query, (role_id,))
        result = self.cursor.fetchone()
        return result['count'] if result else 0
    
    def count_active_users_by_role(self, role_id, time_range):
        days = 7
        if time_range == '30d':
            days = 30
        elif time_range == '90d':
            days = 90
        
        current_date = datetime.now()
        period_start = current_date - timedelta(days=days)
        
        query = """
        SELECT COUNT(DISTINCT u.user_id) as count 
        FROM users u
        JOIN reading_history rh ON u.user_id = rh.user_id
        WHERE u.role_id = %s AND rh.last_read_at >= %s
        """
        self.cursor.execute(query, (role_id, period_start))
        result = self.cursor.fetchone()
        return result['count'] if result else 0
    
    def get_growth_percentage_by_role(self, role_id, time_range):
        days = 7
        if time_range == '30d':
            days = 30
        elif time_range == '90d':
            days = 90
        
        current_date = datetime.now()
        previous_period_end = current_date - timedelta(days=days)
        previous_period_start = previous_period_end - timedelta(days=days)
        
        # Get current period count
        query = """
        SELECT COUNT(*) as count FROM users 
        WHERE role_id = %s AND created_at >= %s AND created_at <= %s
        """
        self.cursor.execute(query, (role_id, previous_period_end, current_date))
        current_count = self.cursor.fetchone()['count'] or 0
        
        # Get previous period count
        query = """
        SELECT COUNT(*) as count FROM users 
        WHERE role_id = %s AND created_at >= %s AND created_at <= %s
        """
        self.cursor.execute(query, (role_id, previous_period_start, previous_period_end))
        previous_count = self.cursor.fetchone()['count'] or 1  # Avoid division by zero
        
        # Calculate growth percentage
        growth = ((current_count - previous_count) / previous_count) * 100
        
        # Format as string with sign
        return f"{'+' if growth >= 0 else ''}{growth:.1f}%"


    
    def close_connection(self):
        self.conn.close()
