-- Enable Realtime for the key tables
-- Run this in your Supabase SQL Editor

-- 1. Create the publication if it doesn't exist (usually 'supabase_realtime' is default)
-- But we'll add our tables to it.
begin;
  -- Remove existing if any to avoid duplicates
  alter publication supabase_realtime drop table if exists public.projects;
  alter publication supabase_realtime drop table if exists public.tasks;
  alter publication supabase_realtime drop table if exists public.user_stories;
  alter publication supabase_realtime drop table if exists public.project_members;

  -- Add tables to the publication
  alter publication supabase_realtime add table public.projects;
  alter publication supabase_realtime add table public.tasks;
  alter publication supabase_realtime add table public.user_stories;
  alter publication supabase_realtime add table public.project_members;
commit;
