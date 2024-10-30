import fitz  # PyMuPDF for PDF handling
import json

def extract_and_chunk_pdf(pdf_path, max_words=200):
    chunks = []
    with fitz.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf):
            text = page.get_text()
            words = text.split()
            # Create chunks based on a word limit
            for i in range(0, len(words), max_words):
                chunk_text = " ".join(words[i:i + max_words])
                chunks.append({
                    "text": chunk_text,
                    "metadata": {
                        "page": page_num + 1
                    }
                })
    return chunks

pdf_path = "py_scripts\\24095558_2024_yks.pdf"
chunked_data = extract_and_chunk_pdf(pdf_path)

# Save the chunked data to JSON with UTF-8 encoding for Turkish characters
with open("lesson_outcomes_chunks.json", "w", encoding="utf-8") as f:
    json.dump(chunked_data, f, ensure_ascii=False)
