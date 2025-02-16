import mysql.connector

class AuthorsModel:
    def __init__(self):
        self.conn=self.get_db_connection()
        
    def get_db_connection(self):
        return mysql.connector.connect(
            host="localhost",
            database="bookauradb",
            user="root",
            password="root"
        )    
        
    def fetch_all_authors(self):
        print("Fetching all authors")
        cur=self.conn.cursor(dictionary=True)
        cur.execute('SELECT * FROM authors') 
        authors=cur.fetchall()
        cur.close()
        return authors
    
    def fetch_author_by_id(self,author_id):
        
        cur=self.conn.cursor(dictionary=True)
        # print('SELECT * FROM authors WHERE author_id='+str(author_id)+'')
        cur.execute('SELECT * FROM authors WHERE author_id='+str(author_id)+'')
        author=cur.fetchone()
        cur.close()
        return author  
    
    def fetch_author_by_user_id(self,user_id):
        query="SELECT * FROM authors WHERE user_id=%s"
        cur=self.conn.cursor(dictionary=True)
        cur.execute(query,(user_id))
        result=cur.fetchone()    
        cur.close()
        
        if result:
            return{
                'author_id':result[0],
                'user_id':result[1],
                'is_flagged':result[2],
                'is_approved':result[3]
            }
        return None
        
    def create_author(self,user_id):
        cur=self.conn.cursor()
        cur.execute('INSERT INTO authors (user_id) VALUES(%s)',(user_id))
        self.conn.commit()
        cur.close()
        
    def delete_author(self,author_id):
        cur=self.conn.cursor()
        cur.execute('DELETE FROM authors WHERE author_id=%s',(author_id,))
        self.conn.commit()
        cur.close()
        
    def close_connection(self):
        self.conn.close( )        