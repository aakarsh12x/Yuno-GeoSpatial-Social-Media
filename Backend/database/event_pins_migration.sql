-- City Pulse: Event Pins table
-- Run once: psql $DATABASE_URL -f Backend/database/event_pins_migration.sql

CREATE TABLE IF NOT EXISTS event_pins (
  id           SERIAL PRIMARY KEY,
  title        TEXT        NOT NULL,
  description  TEXT        NOT NULL,
  category     VARCHAR(30) NOT NULL,
  vibe         VARCHAR(20) NOT NULL,
  source_url   TEXT,
  subreddit    VARCHAR(60),
  reddit_score INTEGER     DEFAULT 0,
  latitude     DECIMAL(10,8) NOT NULL,
  longitude    DECIMAL(11,8) NOT NULL,
  location_name TEXT,
  city         VARCHAR(100) NOT NULL,
  expires_at   TIMESTAMPTZ  NOT NULL,
  created_at   TIMESTAMPTZ  DEFAULT NOW()
);

-- Haversine-based queries use plain lat/lng columns — no PostGIS column needed
-- Expire old pins automatically via expires_at; no cron delete required
CREATE INDEX IF NOT EXISTS idx_event_pins_city       ON event_pins(city);
CREATE INDEX IF NOT EXISTS idx_event_pins_expires_at ON event_pins(expires_at);
CREATE INDEX IF NOT EXISTS idx_event_pins_lat_lng    ON event_pins(latitude, longitude);
