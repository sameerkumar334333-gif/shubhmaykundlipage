-- Fix: "infinite recursion detected in policy for relation 'admins'"
-- Run this in Supabase SQL Editor
-- The issue: admins policy references admins → triggers RLS → infinite loop
-- Fix: Use a SECURITY DEFINER function (runs without RLS) to check admin status

-- 1. Create helper function (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
$$;

-- 2. Drop old policies
DROP POLICY IF EXISTS "Admins can read analytics" ON analytics_events;
DROP POLICY IF EXISTS "Admins can read admins" ON admins;

-- 3. Create new policies using the function (no recursion)
CREATE POLICY "Admins can read analytics" ON analytics_events
  FOR SELECT USING (auth.uid() IS NOT NULL AND public.is_admin());

CREATE POLICY "Admins can read admins" ON admins
  FOR SELECT USING (auth.uid() IS NOT NULL AND public.is_admin());
