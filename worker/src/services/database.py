import os
import numpy as np
import psycopg2
from pgvector.psycopg2 import register_vector

_conn = None

def get_connection():
    global _conn
    if _conn is None or _conn.closed:
        _conn = psycopg2.connect(os.environ["DATABASE_URL"])
        register_vector(_conn)
    return _conn

def save_lead(raw_text: str, source: str, embedding,
              temperature: str, pitch: str,
              score: int = 0, niche: str = "", pain_point: str = "",
              contact_name: str = "", contact_email: str = "", contact_company: str = ""):
    conn = get_connection()
    embedding_array = np.array(embedding, dtype=np.float32)

    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO leads 
              (raw_text, source, embedding, temperature, pitch,
               score, niche, pain_point,
               contact_name, contact_email, contact_company)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (raw_text, source, embedding_array, temperature, pitch,
              score, niche, pain_point,
              contact_name, contact_email, contact_company))
    conn.commit()
    print(f"[db] lead salvo — {contact_name} | {temperature} | score: {score}", flush=True)
