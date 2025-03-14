import PyPDF2

with open("sample2.pdf", "rb") as file:
    reader = PyPDF2.PdfReader(file)
    page = reader.pages[0]  # Get the first page
    text = page.extract_text()
    print(text)