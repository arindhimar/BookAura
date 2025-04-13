import mysql.connector
import logging
from contextlib import contextmanager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DashboardDB:
    """
    Dedicated database connection manager for dashboard operations.
    Uses a single connection with proper resource management.
    """
    
    @staticmethod
    @contextmanager
    def get_connection():
        """
        Context manager for database connections.
        Ensures connections are properly closed after use.
        """
        conn = None
        try:
            conn = mysql.connector.connect(
                host="localhost",
                database="bookauradb",
                user="root",
                password="root",
                connection_timeout=30
            )
            logger.debug("Dashboard DB connection opened")
            yield conn
        except mysql.connector.Error as err:
            logger.error(f"Database connection error: {err}")
            raise
        finally:
            if conn and conn.is_connected():
                conn.close()
                logger.debug("Dashboard DB connection closed")
    
    @staticmethod
    def execute_query(query, params=None, fetch=True, commit=False):
        """
        Execute a query with proper connection handling.
        
        Args:
            query: SQL query to execute
            params: Parameters for the query
            fetch: Whether to fetch results
            commit: Whether to commit changes
            
        Returns:
            Query results if fetch=True, otherwise None
        """
        with DashboardDB.get_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            try:
                if params:
                    cursor.execute(query, params)
                else:
                    cursor.execute(query)
                
                if commit:
                    conn.commit()
                    return cursor.lastrowid
                
                if fetch:
                    return cursor.fetchall()
                return None
            finally:
                cursor.close()
    
    @staticmethod
    def execute_query_one(query, params=None):
        """
        Execute a query and return a single result.
        
        Args:
            query: SQL query to execute
            params: Parameters for the query
            
        Returns:
            Single row result or None
        """
        with DashboardDB.get_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            try:
                if params:
                    cursor.execute(query, params)
                else:
                    cursor.execute(query)
                
                return cursor.fetchone()
            finally:
                cursor.close()
    
    @staticmethod
    def execute_transaction(queries):
        """
        Execute multiple queries in a single transaction.
        
        Args:
            queries: List of (query, params) tuples
            
        Returns:
            True if successful, False otherwise
        """
        with DashboardDB.get_connection() as conn:
            cursor = conn.cursor()
            try:
                conn.start_transaction()
                
                for query, params in queries:
                    cursor.execute(query, params)
                
                conn.commit()
                return True
            except Exception as e:
                conn.rollback()
                logger.error(f"Transaction failed: {e}")
                return False
            finally:
                cursor.close()
