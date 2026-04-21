-- Gas price history table
CREATE TABLE IF NOT EXISTS gas_history (
  id          BIGSERIAL PRIMARY KEY,
  gas_gwei    NUMERIC(12, 4) NOT NULL,
  recorded_at TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- Index for fast time-range queries
CREATE INDEX IF NOT EXISTS idx_gas_history_recorded_at
  ON gas_history (recorded_at DESC);

-- Optional: auto-delete readings older than 7 days to keep the table lean
-- (Run as a Supabase cron job or pg_cron extension)
-- DELETE FROM gas_history WHERE recorded_at < NOW() - INTERVAL '7 days';

-- Row Level Security (enable if using Supabase auth)
ALTER TABLE gas_history ENABLE ROW LEVEL SECURITY;

-- Allow anon read (so the frontend can display history without login)
CREATE POLICY "Public read gas_history"
  ON gas_history FOR SELECT
  USING (true);

-- Allow anon insert (the frontend writes new readings)
CREATE POLICY "Public insert gas_history"
  ON gas_history FOR INSERT
  WITH CHECK (true);
