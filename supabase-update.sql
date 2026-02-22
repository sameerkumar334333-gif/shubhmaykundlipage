-- ShubhMay Analytics – Update SQL
-- Run in Supabase SQL Editor: https://yhxbwlhfjznajnnlduwt.supabase.co
-- Use this to update existing project (schema already run)

-- 1. Index for faster rashi click queries (payload->>'rashi')
CREATE INDEX IF NOT EXISTS idx_analytics_events_rashi 
  ON analytics_events ((payload->>'rashi')) 
  WHERE event_type = 'rashi_selected';

-- 2. Index for event_type + created_at (dashboard queries)
CREATE INDEX IF NOT EXISTS idx_analytics_events_type_created 
  ON analytics_events(event_type, created_at DESC);

-- 3. Ensure payload column exists (if table was created without it)
-- ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS payload jsonb DEFAULT '{}';
