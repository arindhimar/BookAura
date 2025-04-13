from db.connection_pool import DatabasePool
import logging

logger = logging.getLogger(__name__)

class BaseModel:
    """
    Base model class that provides common database functionality.
    All other models should inherit from this class.
    """
    
    def __init__(self):
        """Initialize the model with access to the connection pool."""
        self.db_pool = DatabasePool()
    
    def get_connection(self):
        """Get a connection from the pool."""
        return self.db_pool.get_connection()
    
    def execute_query(self, query, params=None, commit=False):
        """
        Execute a query and optionally commit changes.
        
        Args:
            query: SQL query to execute
            params: Parameters for the query
            commit: Whether to commit changes
            
        Returns:
            Query results if applicable
        """
        conn = None
        cursor = None
        try:
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            
            if commit:
                conn.commit()
                return True
            
            result = cursor.fetchall()
            return result
        except Exception as e:
            logger.error(f"Error executing query: {e}")
            if commit and conn:
                conn.rollback()
            return None if commit else []
        finally:
            if cursor:
                cursor.close()
            if conn:
                self.db_pool.close_connection(conn)
    
    def execute_query_single(self, query, params=None):
        """Execute a query and return a single result."""
        conn = None
        cursor = None
        try:
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            
            result = cursor.fetchone()
            return result
        except Exception as e:
            logger.error(f"Error executing query: {e}")
            return None
        finally:
            if cursor:
                cursor.close()
            if conn:
                self.db_pool.close_connection(conn)
