import re
from langchain_openai import OpenAIEmbeddings

embeddings_model = OpenAIEmbeddings(model="text-embedding-3-small")

def clean_text(text: str) -> str:
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'[^\w\s.,!?@-]', '', text)
    return text.strip()

def chunk_text(text: str, max_chars: int = 2000) -> list[str]:
    sentences = re.split(r'(?<=[.!?])\s+', text)
    chunks, current = [], ""
    for sentence in sentences:
        if len(current) + len(sentence) <= max_chars:
            current += " " + sentence
        else:
            if current:
                chunks.append(current.strip())
            current = sentence
    if current:
        chunks.append(current.strip())
    return chunks

def generate_embedding(text: str) -> list[float]:
    return embeddings_model.embed_query(text)