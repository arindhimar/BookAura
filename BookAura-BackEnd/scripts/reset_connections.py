import mysql.connector

def reset_mysql_connections():
    """
    Connect to MySQL as root and kill idle connections to free up resources.
    Run this script when you encounter 'Too many connections' error.
    """
    try:
        # Connect with admin privileges
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="root"
        )
        
        cursor = conn.cursor()
        
        # Show current processes
        cursor.execute("SHOW PROCESSLIST")
        processes = cursor.fetchall()
        
        print(f"Total connections: {len(processes)}")
        
        # Kill connections that are sleeping for too long
        for process in processes:
            process_id = process[0]
            user = process[1]
            status = process[4]
            time = process[5]
            
            # Don't kill our own connection or system processes
            if user != "root" and status == "Sleep" and time > 100:
                print(f"Killing connection {process_id} from {user} (status: {status}, time: {time})")
                cursor.execute(f"KILL {process_id}")
        
        print("Connection cleanup completed")
        
        # Show max_connections setting
        cursor.execute("SHOW VARIABLES LIKE 'max_connections'")
        max_conn = cursor.fetchone()
        print(f"Current max_connections setting: {max_conn[1]}")
        
        cursor.close()
        conn.close()
        
        return True
    except Exception as e:
        print(f"Error resetting connections: {e}")
        return False

if __name__ == "__main__":
    reset_mysql_connections()
