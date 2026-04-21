-- ─────────────────────────────────────────────────────────────────────────────
-- 002_gas_heatmap.sql
-- Adds the gas_hourly_stats table used by the heatmap component.
-- GasService.js upserts a row for each (day_of_week, hour_of_day) pair
-- incrementally as new gas readings arrive, keeping a running average.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS gas_hourly_stats (
  id           BIGSERIAL    PRIMARY KEY,
  hour_of_day  SMALLINT     NOT NULL CHECK (hour_of_day  BETWEEN 0 AND 23),
  day_of_week  SMALLINT     NOT NULL CHECK (day_of_week  BETWEEN 0 AND 6),
  -- day_of_week: 0=Monday … 6=Sunday  (ISO-like, matches JS getDay()-adjusted)
  avg_gwei     NUMERIC(12, 4) NOT NULL,
  sample_count INTEGER      NOT NULL DEFAULT 1,
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  UNIQUE (hour_of_day, day_of_week)
);

-- Fast lookup by (day, hour)
CREATE INDEX IF NOT EXISTS idx_gas_hourly_day_hour
  ON gas_hourly_stats (day_of_week, hour_of_day);

-- ── Row-Level Security ────────────────────────────────────────────────────────
ALTER TABLE gas_hourly_stats ENABLE ROW LEVEL SECURITY;

-- Public read: frontend can display the heatmap without authentication
CREATE POLICY "Public read gas_hourly_stats"
  ON gas_hourly_stats FOR SELECT
  USING (true);

-- Public insert/update: GasService upserts rows from the browser
CREATE POLICY "Public insert gas_hourly_stats"
  ON gas_hourly_stats FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update gas_hourly_stats"
  ON gas_hourly_stats FOR UPDATE
  USING (true);

-- ── Optional: seed with initial estimates ─────────────────────────────────────
-- Run this block to pre-populate the heatmap so it looks good from day one.
-- These values mirror the JS generateMockHeatmap() function in GasService.js.
-- You can delete seeded rows once real samples accumulate (sample_count grows).
--
-- INSERT INTO gas_hourly_stats (hour_of_day, day_of_week, avg_gwei, sample_count)
-- SELECT
--   h,
--   d,
--   GREATEST(4,
--     CASE WHEN d >= 5 THEN 15 ELSE 28 END
--     + CASE WHEN h BETWEEN 13 AND 21 THEN (CASE WHEN d >= 5 THEN 12 ELSE 28 END) ELSE 0 END
--     + CASE WHEN h BETWEEN 2  AND 7  THEN -12 ELSE 0 END
--     + SIN(d * 7 + h) * 4 + COS(d + h * 3) * 2
--   ),
--   0   -- 0 sample_count flags these as seed rows
-- FROM generate_series(0, 23) h
-- CROSS JOIN generate_series(0, 6) d
-- ON CONFLICT (hour_of_day, day_of_week) DO NOTHING;
