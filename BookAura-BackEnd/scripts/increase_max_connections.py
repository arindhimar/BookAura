import mysql.connector

def increase_max_connections(new_max=300):
    """
    Increase the max_connections setting in MySQL.
    This is a temporary change that will be reset when MySQL restarts.
    For permanent changes, edit the my.cnf file.
    """
    try:
        # Connect with admin privileges
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="root"
        )
        
        cursor = conn.cursor()
        
        # Show current max_connections
        cursor.execute("SHOW VARIABLES LIKE 'max_connections'")
        current_max = cursor.fetchone()
        print(f"Current max_connections: {current_max[1]}")
        
        # Set new max_connections
        cursor.execute(f"SET GLOBAL max_connections = {new_max}")
        
        # Verify the change
        cursor.execute("SHOW VARIABLES LIKE 'max_connections'")
        new_setting = cursor.fetchone()
        print(f"New max_connections: {new_setting[1]}")
        
        cursor.close()
        conn.close()
        
        print("""
Note: This change is temporary and will be reset when MySQL restarts.
For a permanent change, add the following to your my.cnf file:

[mysqld]
max_connections = 200
        """)
        
        return True
    except Exception as e:
        print(f"Error increasing max_connections: {e}")
        return False

if __name__ == "__main__":
    increase_max_connections()
