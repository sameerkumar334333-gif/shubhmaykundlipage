-- Fix: Admin panel shows no data but data exists in Supabase
-- Run in SQL Editor: https://yhxbwlhfjznajnnlduwt.supabase.co

-- 1. Add ALL existing auth users as admins (quick fix - run this)
INSERT INTO admins (user_id, email)
SELECT id, email FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- 2. OR add only your email (replace with your login email)
-- INSERT INTO admins (user_id, email) 
-- SELECT id, email FROM auth.users WHERE email = 'admin@shubhmay.com';
