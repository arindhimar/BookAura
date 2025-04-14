import mysql.connector
from mysql.connector import pooling
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DatabasePool:
    """
    Singleton class to manage a single database connection pool for the entire application.
    """
    _instance = None
    _pool = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatabasePool, cls).__new__(cls)
            cls._initialize_pool()
        return cls._instance

    @classmethod
    def _initialize_pool(cls):
        """Initialize the connection pool with appropriate settings."""
        try:
            cls._pool = pooling.MySQLConnectionPool(
                pool_name="bookaura_pool",
                pool_size=10,  # Reduced from multiple pools to a single pool with reasonable size
                pool_reset_session=True,
                host="localhost",
                database="bookauradb",
                user="root",
                password="root",
                autocommit=False,
                connect_timeout=30
            )
            logger.info("Database connection pool initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize connection pool: {e}")
            raise

    @classmethod
    def get_connection(cls):
        """Get a database connection from the pool."""
        if cls._pool is None:
            cls._initialize_pool()
        return cls._pool.get_connection()

    @staticmethod
    def close_connection(conn):
        """Safely close a database connection."""
        if conn and conn.is_connected():
            conn.close()
            logger.debug("Database connection closed")

    def close_all_connections(self):
        """
        Close all active connections in the pool.
        This is useful for ensuring a clean state after critical operations.
        """
        try:
            if self._pool:
                # Get the underlying pool object
                pool = self._pool._cnx_pool
                if hasattr(pool, '_queue'):
                    # Empty the queue and close each connection
                    while not pool._queue.empty():
                        try:
                            cnx = pool._queue.get(block=False)
                            if cnx and cnx.is_connected():
                                cnx.close()
                        except Exception:
                            pass
                logger.info("All connections in the pool have been closed")
            return True
        except Exception as e:
            logger.error(f"Error closing all connections in pool: {e}")
            return False
