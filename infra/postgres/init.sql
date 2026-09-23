CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS leads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_text        TEXT NOT NULL,
  source          VARCHAR(50),
  temperature     VARCHAR(10),
  embedding       vector(1536),
  pitch           TEXT,
  score           SMALLINT DEFAULT 0,
  niche           VARCHAR(120),
  pain_point      TEXT,
  contact_name    VARCHAR(200),
  contact_email   VARCHAR(320),
  contact_company VARCHAR(200),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS leads_embedding_idx
  ON leads USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS leads_temperature_idx ON leads (temperature);
