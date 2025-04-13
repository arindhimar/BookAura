import mysql.connector
import logging
from mysql.connector import pooling
from typing import List, Dict, Optional, Union
import json
from datetime import datetime
import asyncio
from asyncpg import Pool

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

pool: Pool = None


class BooksModel:
    """
    A comprehensive model for handling all book-related database operations.
    Features connection pooling, proper resource management, and extensive error handling.
    """
    
    _connection_pool = None
    
    def __init__(self):
        """
        Initialize the BooksModel with a connection pool.
        """
        if not BooksModel._connection_pool:
            self._initialize_pool()
        self.conn = None
    
    def init_pool(database_pool: Pool):
        global pool
        pool = database_pool
        logger.info("Database connection pool initialized successfully")

    @classmethod
    def _initialize_pool(cls):
        """
        Initialize the connection pool with custom settings.
        """
        try:
            cls._connection_pool = pooling.MySQLConnectionPool(
                pool_name="bookaura_pool",
                pool_size=10,
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

    def get_connection(self):
        """
        Get a database connection from the pool with error handling.
        Ensures no active transactions are present on the connection.
        """
        try:
            if not self.conn or not self.conn.is_connected():
                self.conn = BooksModel._connection_pool.get_connection()
                logger.debug("Acquired new database connection from pool")
            
            # Roll back any active transactions from previous uses
            if self.conn.in_transaction:
                self.conn.rollback()
                logger.debug("Rolled back lingering transaction")
                
            return self.conn
        except Exception as e:
            logger.error(f"Failed to get database connection: {e}")
            raise
    def close_connection(self):
        """
        Safely close the database connection if it exists.
        """
        if self.conn and self.conn.is_connected():
            self.conn.close()
            self.conn = None
            logger.debug("Database connection closed")

    def __enter__(self):
        """Support for context manager protocol"""
        self.get_connection()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Support for context manager protocol"""
        self.close_connection()

    # --------------------------
    # CRUD Operations
    # --------------------------

    def create_book(self, user_id: int, title: str, description: str, file_url: str, 
               audio_url: str = None, is_public: bool = True, is_approved: bool = False,
               uploaded_by_role: str = 'user', category_ids: List[int] = None, 
               cover_url: str = None) -> int:
        """
        Create a new book record with enhanced transaction handling and connection cleanup.
        """
        conn = self.get_connection()
        try:
            with conn.cursor() as cur:
                # Start fresh transaction
                conn.start_transaction()
                
                # Insert book record
                cur.execute("""
                    INSERT INTO books 
                    (user_id, title, description, fileUrl, audioUrl, is_public, 
                    is_approved, uploaded_by_role, coverUrl) 
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    user_id, title, description, file_url, 
                    audio_url or None, 
                    is_public, 
                    is_approved, 
                    uploaded_by_role,
                    cover_url or "/default-cover.png"
                ))

                book_id = cur.lastrowid
                
                # Initialize views
                cur.execute(
                    'INSERT INTO views (book_id, book_view) VALUES (%s, 0)',
                    (book_id,)
                )

                # Insert validated categories
                if category_ids:
                    cur.execute(
                        "SELECT category_id FROM categories WHERE category_id IN (%s)" % 
                        ','.join(['%s'] * len(category_ids)),
                        tuple(category_ids)
                    )
                    valid_ids = [row[0] for row in cur.fetchall()]
                    
                    if valid_ids:
                        category_values = [(book_id, cid) for cid in valid_ids]
                        cur.executemany(
                            "INSERT INTO book_category (book_id, category_id) VALUES (%s, %s)",
                            category_values
                        )

                # Final commit
                conn.commit()
                logger.info(f"Successfully created book {book_id}")
                return book_id

        except Exception as e:
            logger.error(f"Failed to create book: {str(e)}")
            if conn.is_connected():
                try:
                    conn.rollback()
                    logger.debug("Transaction rolled back due to error")
                except Exception as rollback_error:
                    logger.error(f"Rollback failed: {str(rollback_error)}")
            raise RuntimeError("Book creation failed") from e
        finally:
            try:
                self.close_connection()
            except Exception as close_error:
                logger.error(f"Connection cleanup failed: {str(close_error)}")
            
    def update_book(self, book_id: int, title: str = None, description: str = None, 
                   is_public: bool = None, is_approved: bool = None, 
                   category_ids: List[int] = None) -> bool:
        """
        Update a book's information with transaction support.
        
        Args:
            book_id: ID of the book to update
            title: New title (optional)
            description: New description (optional)
            is_public: New public status (optional)
            is_approved: New approval status (optional)
            category_ids: New list of category IDs (optional)
            
        Returns:
            True if update was successful, False otherwise
        """
        conn = self.get_connection()
        try:
            with conn.cursor() as cur:
                conn.start_transaction()
                
                # Build dynamic update query
                updates = []
                params = []
                
                if title is not None:
                    updates.append("title = %s")
                    params.append(title)
                if description is not None:
                    updates.append("description = %s")
                    params.append(description)
                if is_public is not None:
                    updates.append("is_public = %s")
                    params.append(is_public)
                if is_approved is not None:
                    updates.append("is_approved = %s")
                    params.append(is_approved)
                
                if updates:
                    update_query = "UPDATE books SET " + ", ".join(updates) + " WHERE book_id = %s"
                    params.append(book_id)
                    cur.execute(update_query, tuple(params))
                
                # Update categories if provided
                if category_ids is not None:
                    # First delete existing categories
                    cur.execute(
                        "DELETE FROM book_category WHERE book_id = %s",
                        (book_id,)
                    )
                    
                    # Insert new categories if any
                    if category_ids:
                        # Validate category IDs
                        cur.execute(
                            "SELECT category_id FROM categories WHERE category_id IN (%s)" % 
                            ','.join(['%s'] * len(category_ids)),
                            tuple(category_ids)
                        )
                        valid_ids = [row[0] for row in cur.fetchall()]
                        
                        if valid_ids:
                            category_values = [(book_id, cid) for cid in valid_ids]
                            cur.executemany(
                                "INSERT INTO book_category (book_id, category_id) VALUES (%s, %s)",
                                category_values
                            )
                
                conn.commit()
                logger.info(f"Successfully updated book {book_id}")
                return True

        except Exception as e:
            if conn.is_connected():
                conn.rollback()
            logger.error(f"Failed to update book {book_id}: {e}")
            return False
        finally:
            if 'cur' in locals():
                cur.close()

    def delete_book(self, book_id: int) -> bool:
        """
        Delete a book and all related records with enhanced transaction safety.
        """
        conn = self.get_connection()
        try:
            with conn.cursor() as cur:
                # Start fresh transaction
                conn.start_transaction()
                
                # Disable foreign key checks
                cur.execute("SET FOREIGN_KEY_CHECKS = 0")
                
                # Delete from related tables
                related_tables = [
                    'book_category', 'views', 'bookmarks',
                    'audio_requests', 'reading_history', 'reports'
                ]
                
                for table in related_tables:
                    try:
                        cur.execute(
                            f"DELETE FROM {table} WHERE book_id = %s",
                            (book_id,)
                        )
                        logger.debug(f"Deleted from {table} for book {book_id}")
                    except Exception as e:
                        logger.warning(f"Error deleting from {table}: {str(e)}")
                        continue
                
                # Delete main book record
                cur.execute(
                    "DELETE FROM books WHERE book_id = %s",
                    (book_id,)
                )
                
                # Re-enable foreign key checks
                cur.execute("SET FOREIGN_KEY_CHECKS = 1")
                
                # Final commit
                conn.commit()
                logger.info(f"Successfully deleted book {book_id}")
                return True

        except Exception as e:
            logger.error(f"Failed to delete book {book_id}: {str(e)}")
            if conn.is_connected():
                try:
                    conn.rollback()
                    # Ensure foreign key checks are re-enabled after rollback
                    with conn.cursor() as cur:
                        cur.execute("SET FOREIGN_KEY_CHECKS = 1")
                    logger.debug("Transaction rolled back and FK checks restored")
                except Exception as rollback_error:
                    logger.error(f"Rollback failed: {str(rollback_error)}")
            return False
        finally:
            try:
                self.close_connection()
            except Exception as close_error:
                logger.error(f"Connection cleanup failed: {str(close_error)}")
    # --------------------------
    # Book Fetching Methods
    # --------------------------

    def get_all_books(self,conn=None):
        """
        Fetch all books from the database with proper aggregation
        """
        try:
            if not self.conn or not self.conn.is_connected():
                self.conn = self.get_connection()
                
            with self.conn.cursor(dictionary=True) as cur:
                cur.execute("""
                    SELECT 
                        b.book_id, 
                        b.user_id AS author_id, 
                        u.username AS author_name, 
                        b.title, 
                        b.description, 
                        b.fileUrl, 
                        b.audioUrl,
                        b.is_public, 
                        b.is_approved, 
                        b.uploaded_at, 
                        b.uploaded_by_role,
                        b.coverUrl,
                        COALESCE(GROUP_CONCAT(c.category_name SEPARATOR ', '), '') AS categories,
                        COALESCE(SUM(v.book_view), 0) AS views  -- Changed to SUM aggregation
                    FROM 
                        books b
                    LEFT JOIN 
                        book_category bc ON b.book_id = bc.book_id
                    LEFT JOIN 
                        categories c ON bc.category_id = c.category_id
                    LEFT JOIN 
                        users u ON b.user_id = u.user_id
                    LEFT JOIN 
                        views v ON b.book_id = v.book_id
                    GROUP BY 
                        b.book_id  -- Simplified GROUP BY
                """)
                books = cur.fetchall()
                
                # Convert datetime objects to strings
                for book in books:
                    if book.get('uploaded_at'):
                        book['uploaded_at'] = book['uploaded_at'].isoformat()
                
                return books
        except Exception as e:
            logger.error(f"Failed to fetch all books: {e}")
            return []
        
    def get_book_by_id(self, book_id):
        conn = self.get_connection()  # Get fresh connection
        try:
            with conn.cursor(dictionary=True) as cur:
                cur.execute("""
                    SELECT 
                        b.book_id, 
                        ANY_VALUE(b.user_id) AS author_id, 
                        ANY_VALUE(u.username) AS author_name, 
                        ANY_VALUE(b.title) AS title, 
                        ANY_VALUE(b.description) AS description, 
                        ANY_VALUE(b.fileUrl) AS fileUrl, 
                        ANY_VALUE(b.audioUrl) AS audioUrl,
                        ANY_VALUE(b.is_public) AS is_public, 
                        ANY_VALUE(b.is_approved) AS is_approved, 
                        ANY_VALUE(b.uploaded_at) AS uploaded_at, 
                        ANY_VALUE(b.uploaded_by_role) AS uploaded_by_role,
                        ANY_VALUE(b.coverUrl) AS coverUrl,
                        COALESCE(GROUP_CONCAT(c.category_name SEPARATOR ', '), '') AS categories,
                        COALESCE(SUM(v.book_view), 0) AS views
                    FROM books b
                    LEFT JOIN book_category bc ON b.book_id = bc.book_id
                    LEFT JOIN categories c ON bc.category_id = c.category_id
                    LEFT JOIN users u ON b.user_id = u.user_id
                    LEFT JOIN views v ON b.book_id = v.book_id
                    WHERE b.book_id = %s
                    GROUP BY b.book_id
                """, (book_id,))
                return cur.fetchone()
        except Exception as e:
            logger.error(f"Error fetching book {book_id}: {str(e)}")
            return None
        finally:
            self.close_connection()  # Ensure connection cleanup
    
    def fetch_public_books(self, limit: int = None, offset: int = None) -> List[Dict]:
        """
        Fetch all public books with pagination support.
        
        Args:
            limit: Maximum number of books to return
            offset: Number of books to skip
            
        Returns:
            List of public book dictionaries
        """
        conn = self.get_connection()
        try:
            with conn.cursor(dictionary=True) as cur:
                query = """
                    SELECT 
                        b.book_id, 
                        b.user_id AS author_id, 
                        u.username AS author_name, 
                        b.title, 
                        b.description, 
                        b.fileUrl, 
                        b.audioUrl,
                        b.is_public, 
                        b.is_approved, 
                        b.uploaded_at, 
                        b.uploaded_by_role,
                        b.coverUrl,
                        COALESCE(GROUP_CONCAT(c.category_name SEPARATOR ', '), '') AS categories,
                        COALESCE(SUM(v.book_view), 0) AS views
                    FROM 
                        books b
                    LEFT JOIN 
                        book_category bc ON b.book_id = bc.book_id
                    LEFT JOIN 
                        categories c ON bc.category_id = c.category_id
                    LEFT JOIN 
                        users u ON b.user_id = u.user_id
                    LEFT JOIN 
                        views v ON b.book_id = v.book_id
                    WHERE 
                        b.is_public = 1
                        AND b.is_approved = 1
                    GROUP BY 
                        b.book_id
                """
                
                if limit is not None:
                    query += " LIMIT %s"
                    if offset is not None:
                        query += " OFFSET %s"
                        cur.execute(query, (limit, offset))
                    else:
                        cur.execute(query, (limit,))
                else:
                    cur.execute(query)
                
                books = cur.fetchall()
                
                # Convert datetime objects to strings for JSON serialization
                for book in books:
                    if 'uploaded_at' in book and book['uploaded_at']:
                        book['uploaded_at'] = book['uploaded_at'].isoformat()
                
                return books

        except Exception as e:
            logger.error(f"Failed to fetch public books: {e}")
            return []
        finally:
            if 'cur' in locals():
                cur.close()

    # --------------------------
    # Search and Filter Methods
    # --------------------------

    def search_books(self, query: str, limit: int = 20) -> List[Dict]:
        """
        Search books by title with fuzzy matching.
        
        Args:
            query: Search term
            limit: Maximum number of results to return
            
        Returns:
            List of matching books
        """
        conn = self.get_connection()
        try:
            with conn.cursor(dictionary=True) as cur:
                search_query = """
                    SELECT 
                        b.book_id, 
                        b.user_id AS author_id, 
                        u.username AS author_name, 
                        b.title, 
                        b.description, 
                        b.fileUrl, 
                        b.audioUrl,
                        b.is_public, 
                        b.is_approved, 
                        b.uploaded_at, 
                        b.uploaded_by_role,
                        b.coverUrl,
                        COALESCE(GROUP_CONCAT(c.category_name SEPARATOR ', '), '') AS categories,
                        COALESCE(SUM(v.book_view), 0) AS views,
                        MATCH(b.title) AGAINST(%s IN NATURAL LANGUAGE MODE) AS relevance
                    FROM 
                        books b
                    LEFT JOIN 
                        book_category bc ON b.book_id = bc.book_id
                    LEFT JOIN 
                        categories c ON bc.category_id = c.category_id
                    LEFT JOIN 
                        users u ON b.user_id = u.user_id
                    LEFT JOIN 
                        views v ON b.book_id = v.book_id
                    WHERE 
                        MATCH(b.title) AGAINST(%s IN NATURAL LANGUAGE MODE)
                        AND b.is_approved = 1
                    GROUP BY 
                        b.book_id
                    ORDER BY 
                        relevance DESC
                    LIMIT %s
                """
                
                cur.execute(search_query, (query, query, limit))
                results = cur.fetchall()
                
                # Convert datetime objects to strings
                for book in results:
                    if 'uploaded_at' in book and book['uploaded_at']:
                        book['uploaded_at'] = book['uploaded_at'].isoformat()
                
                return results

        except Exception as e:
            logger.error(f"Failed to search books with query '{query}': {e}")
            return []
        finally:
            if 'cur' in locals():
                cur.close()

    def fetch_books_by_category(self, category_id: int, limit: int = 20) -> List[Dict]:
        """
        Fetch books belonging to a specific category.
        
        Args:
            category_id: ID of the category
            limit: Maximum number of books to return
            
        Returns:
            List of books in the specified category
        """
        conn = self.get_connection()
        try:
            with conn.cursor(dictionary=True) as cur:
                query = """
                    SELECT 
                        b.book_id, 
                        b.user_id AS author_id, 
                        u.username AS author_name, 
                        b.title, 
                        b.description, 
                        b.fileUrl, 
                        b.audioUrl,
                        b.is_public, 
                        b.is_approved, 
                        b.uploaded_at, 
                        b.uploaded_by_role,
                        b.coverUrl,
                        COALESCE(GROUP_CONCAT(c.category_name SEPARATOR ', '), '') AS categories,
                        COALESCE(SUM(v.book_view), 0) AS views
                    FROM 
                        books b
                    JOIN 
                        book_category bc ON b.book_id = bc.book_id
                    LEFT JOIN 
                        categories c ON bc.category_id = c.category_id
                    LEFT JOIN 
                        users u ON b.user_id = u.user_id
                    LEFT JOIN 
                        views v ON b.book_id = v.book_id
                    WHERE 
                        bc.category_id = %s
                        AND b.is_approved = 1
                    GROUP BY 
                        b.book_id
                    LIMIT %s
                """
                
                cur.execute(query, (category_id, limit))
                books = cur.fetchall()
                
                # Convert datetime objects to strings
                for book in books:
                    if 'uploaded_at' in book and book['uploaded_at']:
                        book['uploaded_at'] = book['uploaded_at'].isoformat()
                
                return books

        except Exception as e:
            logger.error(f"Failed to fetch books for category {category_id}: {e}")
            return []
        finally:
            if 'cur' in locals():
                cur.close()

    def fetch_books_by_author(self, author_id: int, include_unapproved: bool = False) -> List[Dict]:
        """
        Fetch all books by a specific author.
        
        Args:
            author_id: ID of the author
            include_unapproved: Whether to include unapproved books
            
        Returns:
            List of books by the specified author
        """
        conn = self.get_connection()
        try:
            with conn.cursor(dictionary=True) as cur:
                query = """
                    SELECT 
                        b.book_id, 
                        b.user_id AS author_id, 
                        u.username AS author_name, 
                        b.title, 
                        b.description, 
                        b.fileUrl, 
                        b.audioUrl,
                        b.is_public, 
                        b.is_approved, 
                        b.uploaded_at, 
                        b.uploaded_by_role,
                        b.coverUrl,
                        COALESCE(GROUP_CONCAT(c.category_name SEPARATOR ', '), '') AS categories,
                        COALESCE(SUM(v.book_view), 0) AS views
                    FROM 
                        books b
                    LEFT JOIN 
                        book_category bc ON b.book_id = bc.book_id
                    LEFT JOIN 
                        categories c ON bc.category_id = c.category_id
                    LEFT JOIN 
                        users u ON b.user_id = u.user_id
                    LEFT JOIN 
                        views v ON b.book_id = v.book_id
                    WHERE 
                        b.user_id = %s
                """
                
                if not include_unapproved:
                    query += " AND b.is_approved = 1"
                
                query += " GROUP BY b.book_id"
                
                cur.execute(query, (author_id,))
                books = cur.fetchall()
                
                # Convert datetime objects to strings
                for book in books:
                    if 'uploaded_at' in book and book['uploaded_at']:
                        book['uploaded_at'] = book['uploaded_at'].isoformat()
                
                return books

        except Exception as e:
            logger.error(f"Failed to fetch books by author {author_id}: {e}")
            return []
        finally:
            if 'cur' in locals():
                cur.close()

    # --------------------------
    # Complete Book Fetching
    # --------------------------

    def fetch_complete_book(self, book_id: int) -> Optional[Dict]:
        """
        Fetch a book with all related information excluding progress
        """
        conn = self.get_connection()
        try:
            with conn.cursor(dictionary=True) as cur:
                # Fetch main book details
                book = self.get_book_by_id(book_id)
                if not book:
                    return None
                
                # Fetch categories for the book
                cur.execute("""
                    SELECT c.category_name 
                    FROM categories c
                    JOIN book_category bc ON c.category_id = bc.category_id
                    WHERE bc.book_id = %s
                """, (book_id,))
                categories = [row['category_name'] for row in cur.fetchall()]
                book['categories'] = ', '.join(categories) if categories else ''
                
                # Fetch related books by category (top 5)
                if categories:
                    category_placeholders = ', '.join(['%s'] * len(categories))
                    cur.execute(f"""
                        SELECT DISTINCT 
                            b.book_id, b.title, b.coverUrl, 
                            u.username AS author_name,
                            COALESCE(SUM(v.book_view), 0) AS views
                        FROM books b
                        JOIN book_category bc ON b.book_id = bc.book_id
                        JOIN categories c ON bc.category_id = c.category_id
                        LEFT JOIN users u ON b.user_id = u.user_id
                        LEFT JOIN views v ON b.book_id = v.book_id
                        WHERE c.category_name IN ({category_placeholders})
                            AND b.book_id != %s
                            AND b.is_approved = 1
                        GROUP BY b.book_id
                        ORDER BY views DESC
                        LIMIT 5
                    """, tuple(categories) + (book_id,))
                    related_by_category = cur.fetchall()
                else:
                    related_by_category = []
                
                # Fetch related books by author (top 5)
                cur.execute("""
                    SELECT 
                        b.book_id, b.title, b.coverUrl,
                        u.username AS author_name,
                        COALESCE(SUM(v.book_view), 0) AS views
                    FROM books b
                    LEFT JOIN users u ON b.user_id = u.user_id
                    LEFT JOIN views v ON b.book_id = v.book_id
                    WHERE b.user_id = %s
                        AND b.book_id != %s
                        AND b.is_approved = 1
                    GROUP BY b.book_id
                    ORDER BY views DESC
                    LIMIT 5
                """, (book['author_id'], book_id))
                related_by_author = cur.fetchall()
                
                # Fetch reading statistics (without progress)
                cur.execute("""
                    SELECT 
                        COUNT(DISTINCT user_id) AS total_readers
                    FROM reading_history
                    WHERE book_id = %s
                """, (book_id,))
                stats = cur.fetchone() or {'total_readers': 0}
                
                return {
                    'book': book,
                    'related_by_category': related_by_category,
                    'related_by_author': related_by_author,
                    'stats': stats
                }

        except Exception as e:
            logger.error(f"Failed to fetch complete book {book_id}: {e}")
            return None
        finally:
            if 'cur' in locals():
                cur.close()
    # --------------------------
    # Approval Methods
    # --------------------------

    def approve_book(self, book_id: int) -> bool:
        """
        Approve a book for public viewing.
        
        Args:
            book_id: ID of the book to approve
            
        Returns:
            True if approval was successful, False otherwise
        """
        conn = self.get_connection()
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE books 
                    SET is_approved = 1 
                    WHERE book_id = %s
                """, (book_id,))
                conn.commit()
                logger.info(f"Approved book {book_id}")
                return True
        except Exception as e:
            logger.error(f"Failed to approve book {book_id}: {e}")
            return False
        finally:
            if 'cur' in locals():
                cur.close()

    def reject_book(self, book_id: int) -> bool:
        """
        Reject a book (mark as not approved).
        
        Args:
            book_id: ID of the book to reject
            
        Returns:
            True if rejection was successful, False otherwise
        """
        conn = self.get_connection()
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE books 
                    SET is_approved = 0 
                    WHERE book_id = %s
                """, (book_id,))
                conn.commit()
                logger.info(f"Rejected book {book_id}")
                return True
        except Exception as e:
            logger.error(f"Failed to reject book {book_id}: {e}")
            return False
        finally:
            if 'cur' in locals():
                cur.close()

    def get_pending_approval_books(self) -> List[Dict]:
        """
        Fetch all books pending approval.
        
        Returns:
            List of books needing approval
        """
        conn = self.get_connection()
        try:
            with conn.cursor(dictionary=True) as cur:
                cur.execute("""
                    SELECT 
                        b.book_id, 
                        b.title, 
                        u.username AS author_name,
                        b.uploaded_at,
                        b.coverUrl,
                        COALESCE(GROUP_CONCAT(c.category_name SEPARATOR ', '), '') AS categories
                    FROM books b
                    LEFT JOIN users u ON b.user_id = u.user_id
                    LEFT JOIN book_category bc ON b.book_id = bc.book_id
                    LEFT JOIN categories c ON bc.category_id = c.category_id
                    WHERE b.is_approved = 0
                    GROUP BY b.book_id
                """)
                books = cur.fetchall()
                
                # Convert datetime objects to strings
                for book in books:
                    if 'uploaded_at' in book and book['uploaded_at']:
                        book['uploaded_at'] = book['uploaded_at'].isoformat()
                
                return books
        except Exception as e:
            logger.error(f"Failed to fetch pending approval books: {e}")
            return []
        finally:
            if 'cur' in locals():
                cur.close()

    # --------------------------
    # Statistics and Dashboard Methods
    # --------------------------

    def count_books(self, time_period: str = None) -> int:
        """
        Count total books, optionally filtered by time period.
        
        Args:
            time_period: Optional time period filter ('today', 'week', 'month', 'year')
            
        Returns:
            Total count of books
        """
        conn = self.get_connection()
        try:
            with conn.cursor() as cur:
                query = "SELECT COUNT(*) FROM books"
                
                if time_period:
                    if time_period == 'today':
                        query += " WHERE DATE(uploaded_at) = CURDATE()"
                    elif time_period == 'week':
                        query += " WHERE uploaded_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)"
                    elif time_period == 'month':
                        query += " WHERE uploaded_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)"
                    elif time_period == 'year':
                        query += " WHERE uploaded_at >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)"
                
                cur.execute(query)
                result = cur.fetchone()
                return result[0] if result else 0
        except Exception as e:
            logger.error(f"Failed to count books: {e}")
            return 0
        finally:
            if 'cur' in locals():
                cur.close()

    def count_flagged_books(self, time_period: str = None) -> int:
        """
        Count total flagged/reported books.
        
        Args:
            time_period: Optional time period filter ('today', 'week', 'month', 'year')
            
        Returns:
            Total count of flagged books
        """
        conn = self.get_connection()
        try:
            with conn.cursor() as cur:
                # First check if reports table exists
                cur.execute("""
                    SELECT COUNT(*) 
                    FROM information_schema.tables 
                    WHERE table_schema = DATABASE() 
                    AND table_name = 'reports'
                """)
                table_exists = cur.fetchone()[0] > 0
                
                if not table_exists:
                    return 0
                
                query = "SELECT COUNT(DISTINCT book_id) FROM reports"
                
                if time_period:
                    if time_period == 'today':
                        query += " WHERE DATE(reported_at) = CURDATE()"
                    elif time_period == 'week':
                        query += " WHERE reported_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)"
                    elif time_period == 'month':
                        query += " WHERE reported_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)"
                    elif time_period == 'year':
                        query += " WHERE reported_at >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)"
                
                cur.execute(query)
                result = cur.fetchone()
                return result[0] if result else 0
        except Exception as e:
            logger.error(f"Failed to count flagged books: {e}")
            return 0
        finally:
            if 'cur' in locals():
                cur.close()

    async def get_books_count():
        try:
            async with pool.acquire() as conn:
                async with conn.transaction():
                    result = await conn.fetchval("SELECT COUNT(*) FROM books")
                    return result
        except Exception as e:
            logger.error(f"Failed to get books count: {e}")
            return 0

    async def get_books_category_distribution():
        try:
            async with pool.acquire() as conn:
                async with conn.transaction():
                    query = """
                        SELECT c.name AS category, COUNT(b.id) AS book_count
                        FROM books b
                        JOIN categories c ON b.category_id = c.id
                        GROUP BY c.name
                    """
                    rows = await conn.fetch(query)
                    return [dict(row) for row in rows]
        except Exception as e:
            logger.error(f"Failed to get category distribution: {e}")
            return []
    
    def get_top_books(self, conn, limit):
        try:
            with conn.cursor(dictionary=True) as cur:
                cur.execute("""
                    SELECT b.book_id, b.title, u.username AS author_name,
                           SUM(v.book_view) AS views
                    FROM books b
                    LEFT JOIN users u ON b.user_id = u.user_id
                    LEFT JOIN views v ON b.book_id = v.book_id
                    WHERE b.is_approved = 1
                    GROUP BY b.book_id
                    ORDER BY views DESC
                    LIMIT %s
                """, (limit,))
                return cur.fetchall()
        except Exception as e:
            logger.error(f"Top books error: {e}")
            return []
    async def get_publisher_growth(days=7):
        try:
            async with pool.acquire() as conn:
                async with conn.transaction():
                    start_date = datetime.now() - timedelta(days=days)
                    query = """
                        SELECT DATE(created_at) AS date, COUNT(*) AS count
                        FROM users
                        WHERE role = 'publisher' AND created_at >= $1
                        GROUP BY date
                        ORDER BY date
                    """
                    rows = await conn.fetch(query, start_date)
                    return [dict(row) for row in rows]
        except Exception as e:
            logger.error(f"Failed to fetch publisher growth: {e}")
            return []

    async def get_books_chart_data(days=7):
        try:
            async with pool.acquire() as conn:
                async with conn.transaction():
                    start_date = datetime.now() - timedelta(days=days)
                    query = """
                        SELECT DATE(created_at) AS date, COUNT(*) AS count
                        FROM books
                        WHERE created_at >= $1
                        GROUP BY date
                        ORDER BY date
                    """
                    rows = await conn.fetch(query, start_date)
                    return [dict(row) for row in rows]
        except Exception as e:
            logger.error(f"Failed to fetch chart data: {e}")
            return []

    def get_top_books(self, limit: int = 5) -> List[Dict]:
        try:
            conn = self.get_connection()
            with conn.cursor(dictionary=True) as cur:  # Use context manager
                cur.execute("""
                    SELECT 
                        b.book_id,
                        b.title, 
                        u.username AS author_name,
                        b.coverUrl,
                        COALESCE(v.book_view, 0) AS views
                    FROM books b
                    LEFT JOIN users u ON b.user_id = u.user_id
                    LEFT JOIN views v ON b.book_id = v.book_id
                    WHERE b.is_approved = 1
                    ORDER BY views DESC
                    LIMIT %s
                """, (limit,))
                return cur.fetchall()
        except Exception as e:
            logger.error(f"Failed to fetch top books: {e}")
            return []
        
        
    def get_category_distribution(self, conn):
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT c.category_name, COUNT(bc.book_id) AS count
                    FROM categories c
                    LEFT JOIN book_category bc ON c.category_id = bc.category_id
                    LEFT JOIN books b ON bc.book_id = b.book_id AND b.is_approved = 1
                    GROUP BY c.category_id
                    ORDER BY count DESC
                    LIMIT 10
                """)
                return [{"name": row[0], "count": row[1]} for row in cur.fetchall()]
        except Exception as e:
            logger.error(f"Category distribution error: {e}")
            return []

    def get_upload_trends(self, time_period: str = 'month') -> List[Dict]:
        """
        Get book upload trends over time.
        
        Args:
            time_period: Time period for grouping ('day', 'week', 'month')
            
        Returns:
            List of upload counts grouped by time period
        """
        conn = self.get_connection()
        try:
            with conn.cursor(dictionary=True) as cur:
                if time_period == 'day':
                    group_by = "DATE(uploaded_at)"
                    interval = "1 DAY"
                elif time_period == 'week':
                    group_by = "YEARWEEK(uploaded_at)"
                    interval = "1 WEEK"
                else:  # default to month
                    group_by = "DATE_FORMAT(uploaded_at, '%Y-%m')"
                    interval = "1 MONTH"
                
                cur.execute(f"""
                    SELECT 
                        {group_by} AS period,
                        COUNT(*) AS count
                    FROM books
                    WHERE uploaded_at >= DATE_SUB(CURDATE(), INTERVAL 12 {interval})
                    GROUP BY period
                    ORDER BY period
                """)
                return cur.fetchall()
        except Exception as e:
            logger.error(f"Failed to fetch upload trends: {e}")
            return []
        finally:
            if 'cur' in locals():
                cur.close()

    # --------------------------
    # View Tracking Methods
    # --------------------------

    def increment_book_views(self, book_id: int) -> bool:
        """
        Increment the view count for a book.
        
        Args:
            book_id: ID of the book to increment views for
            
        Returns:
            True if successful, False otherwise
        """
        conn = self.get_connection()
        try:
            with conn.cursor() as cur:
                # Try to update existing view count
                cur.execute("""
                    UPDATE views 
                    SET book_view = book_view + 1 
                    WHERE book_id = %s
                """, (book_id,))
                
                # If no rows were updated, insert a new record
                if cur.rowcount == 0:
                    cur.execute("""
                        INSERT INTO views (book_id, book_view) 
                        VALUES (%s, 1)
                    """, (book_id,))
                
                conn.commit()
                return True
        except Exception as e:
            logger.error(f"Failed to increment views for book {book_id}: {e}")
            return False
        finally:
            if 'cur' in locals():
                cur.close()

    def get_book_views(self, book_id: int) -> int:
        """
        Get the current view count for a book.
        
        Args:
            book_id: ID of the book to get views for
            
        Returns:
            Current view count
        """
        conn = self.get_connection()
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT COALESCE(book_view, 0) 
                    FROM views 
                    WHERE book_id = %s
                """, (book_id,))
                result = cur.fetchone()
                return result[0] if result else 0
        except Exception as e:
            logger.error(f"Failed to get views for book {book_id}: {e}")
            return 0
        finally:
            if 'cur' in locals():
                cur.close()

    # --------------------------
    # Utility Methods
    # --------------------------

    def book_exists(self, book_id: int) -> bool:
        """
        Check if a book exists in the database.
        
        Args:
            book_id: ID of the book to check
            
        Returns:
            True if book exists, False otherwise
        """
        conn = self.get_connection()
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT 1 FROM books WHERE book_id = %s
                """, (book_id,))
                return cur.fetchone() is not None
        except Exception as e:
            logger.error(f"Failed to check if book {book_id} exists: {e}")
            return False
        finally:
            if 'cur' in locals():
                cur.close()

    def is_book_owner(self, book_id: int, user_id: int) -> bool:
        """
        Check if a user is the owner of a book.
        
        Args:
            book_id: ID of the book
            user_id: ID of the user to check
            
        Returns:
            True if user owns the book, False otherwise
        """
        conn = self.get_connection()
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT 1 FROM books 
                    WHERE book_id = %s AND user_id = %s
                """, (book_id, user_id))
                return cur.fetchone() is not None
        except Exception as e:
            logger.error(f"Failed to check book ownership: {e}")
            return False
        finally:
            if 'cur' in locals():
                cur.close()

    def get_book_owner(self, book_id: int) -> Optional[int]:
        """
        Get the owner (user_id) of a book.
        
        Args:
            book_id: ID of the book
            
        Returns:
            user_id of the owner, or None if not found
        """
        conn = self.get_connection()
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT user_id FROM books WHERE book_id = %s
                """, (book_id,))
                result = cur.fetchone()
                return result[0] if result else None
        except Exception as e:
            logger.error(f"Failed to get book owner for book {book_id}: {e}")
            return None
        finally:
            if 'cur' in locals():
                cur.close()
        
    def get_books_by_category(self) -> List[Dict]:
        try:
            conn = self.get_connection()  # Get the connection without using 'with'
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute("""
                    SELECT 
                        c.category_name AS name, 
                        COUNT(bc.book_id) AS books
                    FROM categories c
                    LEFT JOIN book_category bc 
                        ON c.category_id = bc.category_id
                    LEFT JOIN books b 
                        ON bc.book_id = b.book_id 
                        AND b.is_approved = 1
                    GROUP BY c.category_id
                    ORDER BY books DESC
                    LIMIT 5
                """)
                return cursor.fetchall()
        except mysql.connector.Error as err:
            logger.error(f"Database error in get_books_by_category: {err}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error in get_books_by_category: {e}")
            return []
        
        
    def count_books_by_publisher(self, user_id):
        conn = None
        cursor = None
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute('''
                SELECT COUNT(*) FROM books WHERE user_id = %s
            ''', (user_id,))
            result = cursor.fetchone()
            return result[0] if result else 0
        except Exception as e:
            logger.error(f"Error counting books: {e}")
            return 0
        finally:
            if cursor:
                cursor.close()
            if conn:
                self.close_connection()  
    
    def fetch_books_by_publisher(self, publisher_id):
        """
        Fetch all books published by a specific publisher.
        
        Args:
            publisher_id: ID of the publisher (user_id)
            
        Returns:
            List of books published by the specified publisher
        """
        try:
            if not self.conn or not self.conn.is_connected():
                self.conn = self.get_connection()
                
            with self.conn.cursor(dictionary=True) as cur:
                cur.execute("""
                    SELECT 
                        b.book_id, 
                        b.user_id AS author_id, 
                        u.username AS author_name, 
                        b.title, 
                        b.description, 
                        b.fileUrl, 
                        b.audioUrl,
                        b.is_public, 
                        b.is_approved, 
                        b.uploaded_at, 
                        b.uploaded_by_role,
                        b.coverUrl,
                        COALESCE(GROUP_CONCAT(c.category_name SEPARATOR ', '), '') AS categories,
                        COALESCE(MAX(v.book_view), 0) AS views
                    FROM 
                        books b
                    LEFT JOIN 
                        book_category bc ON b.book_id = bc.book_id
                    LEFT JOIN 
                        categories c ON bc.category_id = c.category_id
                    LEFT JOIN 
                        users u ON b.user_id = u.user_id
                    LEFT JOIN 
                        views v ON b.book_id = v.book_id
                    WHERE 
                        b.user_id = %s
                    GROUP BY 
                        b.book_id, b.user_id, u.username, b.title, b.description, 
                        b.fileUrl, b.audioUrl, b.is_public, b.is_approved, 
                        b.uploaded_at, b.uploaded_by_role, b.coverUrl
                """, (publisher_id,))
                
                books = cur.fetchall()
                
                # Convert datetime objects to strings for JSON serialization
                for book in books:
                    if 'uploaded_at' in book and book['uploaded_at']:
                        book['uploaded_at'] = book['uploaded_at'].isoformat()
                
                return books
        except Exception as e:
            logger.error(f"Failed to fetch books for publisher {publisher_id}: {e}")
            return []

    def fetch_books_by_publisher_user_id(self, user_id):
        """
        Fetch all books published by a specific user.
        
        Args:
            user_id: ID of the publisher (user_id)
            
        Returns:
            List of books published by the specified user
        """
        try:
            if not self.conn or not self.conn.is_connected():
                self.conn = self.get_db_connection()
                
            with self.conn.cursor(dictionary=True) as cur:
                cur.execute("""
                    SELECT 
                        b.book_id, 
                        b.user_id AS author_id, 
                        u.username AS author_name, 
                        b.title, 
                        b.description, 
                        b.fileUrl, 
                        b.audioUrl,
                        b.is_public, 
                        b.is_approved, 
                        b.uploaded_at, 
                        b.uploaded_by_role,
                        b.coverUrl,
                        COALESCE(GROUP_CONCAT(c.category_name SEPARATOR ', '), '') AS categories,
                        COALESCE(v.book_view, 0) AS views
                    FROM 
                        books b
                    LEFT JOIN 
                        book_category bc ON b.book_id = bc.book_id
                    LEFT JOIN 
                        categories c ON bc.category_id = c.category_id
                    LEFT JOIN 
                        users u ON b.user_id = u.user_id
                    LEFT JOIN 
                        views v ON b.book_id = v.book_id
                    WHERE 
                        b.user_id = %s
                    GROUP BY 
                        b.book_id, b.user_id, u.username, b.title, b.description, 
                        b.fileUrl, b.audioUrl, b.is_public, b.is_approved, 
                        b.uploaded_at, b.uploaded_by_role, b.coverUrl
                """, (user_id,))
            
            books = cur.fetchall()
            
            # Convert datetime objects to strings for JSON serialization
            for book in books:
                if 'uploaded_at' in book and book['uploaded_at']:
                    book['uploaded_at'] = book['uploaded_at'].isoformat()
            
            return books
        except Exception as e:
            logger.error(f"Failed to fetch books for user {user_id}: {e}")
            return []

    def get_all_books2(self):
        """
        Fetch all books from the database with proper aggregation
        """
        try:
            if not self.conn or not self.conn.is_connected():
                self.conn = self.get_connection()
                
            with self.conn.cursor(dictionary=True) as cur:
                cur.execute("""
                    SELECT 
                        b.book_id, 
                        b.user_id AS author_id, 
                        u.username AS author_name, 
                        b.title, 
                        b.description, 
                        b.fileUrl, 
                        b.audioUrl,
                        b.is_public, 
                        b.is_approved, 
                        b.uploaded_at, 
                        b.uploaded_by_role,
                        b.coverUrl,
                        COALESCE(GROUP_CONCAT(c.category_name SEPARATOR ', '), '') AS categories,
                        COALESCE(SUM(v.book_view), 0) AS views  -- Changed to SUM aggregation
                    FROM 
                        books b
                    LEFT JOIN 
                        book_category bc ON b.book_id = bc.book_id
                    LEFT JOIN 
                        categories c ON bc.category_id = c.category_id
                    LEFT JOIN 
                        users u ON b.user_id = u.user_id
                    LEFT JOIN 
                        views v ON b.book_id = v.book_id
                    GROUP BY 
                        b.book_id  -- Simplified GROUP BY
                """)
                books = cur.fetchall()
                
                # Convert datetime objects to strings
                for book in books:
                    if book.get('uploaded_at'):
                        book['uploaded_at'] = book['uploaded_at'].isoformat()
                
                return books
        except Exception as e:
            logger.error(f"Failed to fetch all books: {e}")
            return []
    
    
    def get_books_by_category2(self) -> List[Dict]:
        try:
            conn = self.get_connection()  # Get the connection without using 'with'
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute("""
                    SELECT 
                        c.category_name AS name, 
                        COUNT(bc.book_id) AS books
                    FROM categories c
                    LEFT JOIN book_category bc 
                        ON c.category_id = bc.category_id
                    LEFT JOIN books b 
                        ON bc.book_id = b.book_id 
                        AND b.is_approved = 1
                    GROUP BY c.category_id
                    ORDER BY books DESC
                    LIMIT 5
                """)
                return cursor.fetchall()
        except mysql.connector.Error as err:
            logger.error(f"Database error in get_books_by_category: {err}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error in get_books_by_category: {e}")
            return []
    
    def get_top_books2(self, limit: int = 5) -> List[Dict]:
        try:
            conn = self.get_connection()
            with conn.cursor(dictionary=True) as cur:  # Use context manager
                cur.execute("""
                    SELECT 
                        b.book_id,
                        b.title, 
                        u.username AS author_name,
                        b.coverUrl,
                        COALESCE(v.book_view, 0) AS views
                    FROM books b
                    LEFT JOIN users u ON b.user_id = u.user_id
                    LEFT JOIN views v ON b.book_id = v.book_id
                    WHERE b.is_approved = 1
                    ORDER BY views DESC
                    LIMIT %s
                """, (limit,))
                return cur.fetchall()
        except Exception as e:
            logger.error(f"Failed to fetch top books: {e}")
            return []
        
        
