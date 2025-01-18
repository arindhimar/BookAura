import pdfplumber

with pdfplumber.open("sample2.pdf") as pdf:
    first_page = pdf.pages[0]  # Access the first page
    text = first_page.extract_text()
    print(text)