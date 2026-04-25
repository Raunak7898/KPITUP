-- Explicitly fix project deletion RLS
-- Run this in your Supabase SQL Editor

-- 1. Drop existing delete policy if it exists
drop policy if exists "projects_delete_admin_only" on public.projects;
drop policy if exists "Only admin can delete projects" on public.projects;

-- 2. Create a very robust delete policy
create policy "projects_delete_admin_only"
  on public.projects for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

-- 3. Ensure ON DELETE CASCADE is set for all related tables
-- This is usually done at table creation, but we can double check or re-apply if needed.
-- project_members
alter table public.project_members
  drop constraint if exists project_members_project_id_fkey,
  add constraint project_members_project_id_fkey
  foreign key (project_id)
  references public.projects(id)
  on delete cascade;

-- user_stories
alter table public.user_stories
  drop constraint if exists user_stories_project_id_fkey,
  add constraint user_stories_project_id_fkey
  foreign key (project_id)
  references public.projects(id)
  on delete cascade;

-- tasks
alter table public.tasks
  drop constraint if exists tasks_project_id_fkey,
  add constraint tasks_project_id_fkey
  foreign key (project_id)
  references public.projects(id)
  on delete cascade;

-- task_reviews (linked to tasks, which are linked to projects)
alter table public.task_reviews
  drop constraint if exists task_reviews_task_id_fkey,
  add constraint task_reviews_task_id_fkey
  foreign key (task_id)
  references public.tasks(id)
  on delete cascade;
