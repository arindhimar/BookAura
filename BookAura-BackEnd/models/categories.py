import mysql.connector

class CategoriesModel:
    def __init__(self):
        self.conn = self.get_db_connection()
    
    def get_db_connection(self):
        return mysql.connector.connect(
            host="localhost",
            database="bookauradb",
            user="root",
            password="root"
        )
    
    def fetch_all_categories(self):
        cur = self.conn.cursor()
        cur.execute('SELECT * FROM categories')
        categories = cur.fetchall()
        cur.close()
        return categories
    
    def fetch_category_by_id(self, category_id):
        cur = self.conn.cursor()
        cur.execute('SELECT * FROM categories WHERE category_id = %s', (category_id,))
        category = cur.fetchone()
        cur.close()
        return category
    
    def fetch_category_by_name(self, category_name):
        cur = self.conn.cursor()
        cur.execute('SELECT * FROM categories WHERE category_name = %s', (category_name,))
        category = cur.fetchone()
        cur.close()
        return category
    
    def create_category(self, category_name):
        cur = self.conn.cursor()
        cur.execute('INSERT INTO categories (category_name) VALUES (%s)', (category_name,))
        self.conn.commit()
        cur.close()
        
    def update_category(self, category_id, category_name):
        cur = self.conn.cursor()
        cur.execute('UPDATE categories SET category_name = %s WHERE category_id = %s', (category_name, category_id))
        self.conn.commit()
        cur.close()
    
    def delete_category(self, category_id):
        cur = self.conn.cursor()
        cur.execute('DELETE FROM categories WHERE category_id = %s', (category_id,))
        self.conn.commit()
        cur.close()
    
    def close_connection(self):
        self.conn.close()
        
            
    
    
    