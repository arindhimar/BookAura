import os
import logging
import json
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create directory for failed translations
FAILED_TRANSLATIONS_DIR = 'failed_translations/'
os.makedirs(FAILED_TRANSLATIONS_DIR, exist_ok=True)

def save_failed_translation(text, language, error_message, book_title=None):
    """
    Save failed translation text to a file for debugging and retry.
    
    Args:
        text: The text that failed to translate
        language: Target language code (e.g., 'hi', 'mr')
        error_message: The error message from the translation attempt
        book_title: Optional book title for the filename
    
    Returns:
        Path to the saved file
    """
    try:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        book_info = f"_{book_title}" if book_title else ""
        filename = f"failed_translation_{language}{book_info}_{timestamp}.txt"
        filepath = os.path.join(FAILED_TRANSLATIONS_DIR, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(f"=== TRANSLATION ERROR ===\n")
            f.write(f"Language: {language}\n")
            f.write(f"Timestamp: {datetime.now().isoformat()}\n")
            f.write(f"Error: {error_message}\n\n")
            f.write("=== ORIGINAL TEXT ===\n")
            f.write(text)
        
        # Also save the full text to a separate file for easier debugging
        full_text_filename = f"full_text_{language}{book_info}_{timestamp}.txt"
        full_text_filepath = os.path.join(FAILED_TRANSLATIONS_DIR, full_text_filename)
        with open(full_text_filepath, 'w', encoding='utf-8') as f:
            f.write(text)
        
        logger.info(f"Saved failed translation to {filepath}")
        logger.info(f"Saved full text for debugging to {full_text_filepath}")
        return filepath
    except Exception as e:
        logger.error(f"Error saving failed translation: {e}")
        return None

def mark_book_as_approved(book_id):
    """
    Update the book status to approved after processing is complete.
    
    Args:
        book_id: ID of the book for updating approval status
        
    Returns:
        Boolean indicating success or failure
    """
    from models.books import BooksModel
    
    try:
        books_model = BooksModel()
        result = books_model.update_approval_status(book_id, True)
        if result:
            logger.info(f"Book {book_id} marked as approved")
        else:
            logger.error(f"Failed to mark book {book_id} as approved")
        return result
    except Exception as e:
        logger.error(f"Error marking book as approved: {e}")
        return False
