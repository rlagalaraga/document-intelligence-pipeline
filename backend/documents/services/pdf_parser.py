import pdfplumber


def extract_text_from_pdf(file_path: str) -> str:
    """Extract all text from a PDF file."""
    text = []
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text.append(page_text)
    return "\n".join(text)
