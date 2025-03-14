from pdf2image import convert_from_path
import pytesseract

# Convert PDF to images
pages = convert_from_path('sample2.pdf', 300)

# Extract text from the first page
first_page_text = pytesseract.image_to_string(pages[0])
print(first_page_text)