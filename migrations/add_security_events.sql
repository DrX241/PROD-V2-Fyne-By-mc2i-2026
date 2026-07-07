CREATE TABLE IF NOT EXISTS security_events (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'info',
  ip VARCHAR(64),
  user_agent TEXT,
  username VARCHAR(255),
  user_id INTEGER,
  details JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "IDX_sec_events_type" ON security_events (type);
CREATE INDEX IF NOT EXISTS "IDX_sec_events_date" ON security_events (created_at);
CREATE INDEX IF NOT EXISTS "IDX_sec_events_ip" ON security_events (ip);
