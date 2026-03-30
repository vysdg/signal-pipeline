CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS leads (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_text    TEXT NOT NULL,
  source      VARCHAR(50),
  temperature VARCHAR(10),
  embedding   vector(1536),
  pitch       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS leads_embedding_idx
  ON leads USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);