-- ShubhMay Analytics Schema
-- Run this in Supabase SQL Editor: https://yhxbwlhfjznajnnlduwt.supabase.co

-- 1. Analytics events table (all tracking)
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  session_id text,
  page_url text,
  referrer text,
  event_type text NOT NULL,
  payload jsonb DEFAULT '{}',
  user_agent text,
  language text
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id);

-- 2. Admins table (who can view analytics)
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email text,
  created_at timestamptz DEFAULT now()
);

-- 3. Helper function (avoids infinite recursion in admins policy)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
$$;

-- 4. RLS policies
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Anyone can INSERT events (anon + authenticated)
DROP POLICY IF EXISTS "Allow insert analytics" ON analytics_events;
CREATE POLICY "Allow insert analytics" ON analytics_events
  FOR INSERT WITH CHECK (true);

-- Only admins can SELECT (uses is_admin() to avoid recursion)
DROP POLICY IF EXISTS "Admins can read analytics" ON analytics_events;
CREATE POLICY "Admins can read analytics" ON analytics_events
  FOR SELECT USING (auth.uid() IS NOT NULL AND public.is_admin());

DROP POLICY IF EXISTS "Admins can read admins" ON admins;
CREATE POLICY "Admins can read admins" ON admins
  FOR SELECT USING (auth.uid() IS NOT NULL AND public.is_admin());

-- 5. Add your first admin
-- Step A: Supabase Dashboard > Authentication > Users > Add user (create with email + password)
-- Step B: Copy the user's UUID from the Users table
-- Step C: Run this (replace with your UUID and email):
--   INSERT INTO admins (user_id, email) VALUES ('paste-uuid-here', 'admin@shubhmay.com');
