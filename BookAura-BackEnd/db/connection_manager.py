import mysql.connector
from mysql.connector import pooling
import logging
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ConnectionManager:
    """
    Singleton class to manage database connections across the application.
    """
    _instance = None
    _pool = None
    _max_retries = 3
    _retry_delay = 2  # seconds
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ConnectionManager, cls).__new__(cls)
            cls._initialize_pool()
        return cls._instance
    
    @classmethod
    def _initialize_pool(cls):
        """Initialize the connection pool with appropriate settings."""
        for attempt in range(cls._max_retries):
            try:
                cls._pool = pooling.MySQLConnectionPool(
                    pool_name="bookaura_shared_pool",
                    pool_size=10,  # Reasonable pool size
                    pool_reset_session=True,
                    host="localhost",
                    database="bookauradb",
                    user="root",
                    password="root",
                    autocommit=False,
                    connect_timeout=30
                )
                logger.info("Shared database connection pool initialized successfully")
                return
            except mysql.connector.Error as err:
                if err.errno == 1040 and attempt < cls._max_retries - 1:  # Too many connections
                    logger.warning(f"Too many connections, retrying in {cls._retry_delay} seconds (attempt {attempt+1}/{cls._max_retries})")
                    time.sleep(cls._retry_delay)
                else:
                    logger.error(f"Failed to initialize connection pool: {err}")
                    raise
    
    @classmethod
    def get_connection(cls):
        """Get a database connection from the pool with retry logic."""
        if cls._pool is None:
            cls._initialize_pool()
            
        for attempt in range(cls._max_retries):
            try:
                return cls._pool.get_connection()
            except mysql.connector.Error as err:
                if err.errno == 1040 and attempt < cls._max_retries - 1:  # Too many connections
                    logger.warning(f"Too many connections, retrying in {cls._retry_delay} seconds (attempt {attempt+1}/{cls._max_retries})")
                    time.sleep(cls._retry_delay)
                else:
                    logger.error(f"Failed to get connection: {err}")
                    raise
    
    @staticmethod
    def close_connection(conn):
        """Safely close a database connection."""
        if conn and conn.is_connected():
            conn.close()
            logger.debug("Database connection closed")

# Global instance that can be imported
connection_manager = ConnectionManager()
