import os
import psycopg2
from pgvector.psycopg2 import register_vector

_conn = None

def get_connection():
    global _conn
    if _conn is None or _conn.closed:
        _conn = psycopg2.connect(os.environ["DATABASE_URL"])
        register_vector(_conn)
    return _conn

def save_lead(raw_text: str, source: str, embedding: list,
              temperature: str, pitch: str,
              contact_name: str = "", contact_email: str = "",
              contact_company: str = ""):
    conn = get_connection()
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO leads (raw_text, source, embedding, temperature, pitch,
                               contact_name, contact_email, contact_company)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (raw_text, source, embedding, temperature, pitch,
              contact_name, contact_email, contact_company))
    conn.commit()
