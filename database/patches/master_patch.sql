-- ============================================================
-- KPIT Task Workflow Fix Migration
-- Run this in Supabase SQL Editor
-- ============================================================

-- 0. CRITICAL: Ensure the admin profile has role='admin'.
--    If the admin signed up before the trigger existed, their role
--    defaults to 'member' and ALL project inserts will be silently blocked.
insert into public.profiles (id, email, full_name, role)
select 
  au.id,
  au.email,
  coalesce(au.raw_user_meta_data->>'full_name', au.email),
  'admin'::workspace_role
from auth.users au
where lower(au.email) = 'raunak789805@gmail.com'
on conflict (id) do update
  set role = 'admin'::workspace_role;

-- 0b. Recreate the signup trigger so future admin logins always get role='admin'
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email),
    case
      when lower(new.email) = 'raunak789805@gmail.com' then 'admin'::workspace_role
      else 'member'::workspace_role
    end
  )
  on conflict (id) do update
    set
      email = excluded.email,
      full_name = coalesce(excluded.full_name, profiles.full_name),
      role = case
        when lower(excluded.email) = 'raunak789805@gmail.com' then 'admin'::workspace_role
        else profiles.role  -- don't downgrade existing roles
      end;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 0c. Fix the projects_insert policy — only checks role='admin'
drop policy if exists "projects_insert_admin_only" on public.projects;
drop policy if exists "Only admin can create projects" on public.projects;
create policy "projects_insert_admin_only"
  on public.projects for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

-- 0d. Fix the projects_visible_to_members policy — eliminate recursion!
--    Admin can see all, owner can see theirs, members can see joined projects.
drop policy if exists "projects_visible_to_members" on public.projects;
drop policy if exists "Projects are viewable by owner and members" on public.projects;
drop policy if exists "projects_select_policy" on public.projects;
create policy "projects_visible_to_members"
  on public.projects for select
  using (
    owner_id = auth.uid()
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
    or exists (
      select 1
      from public.project_members pm
      where pm.project_id = projects.id
        and pm.profile_id = auth.uid()
    )
  );

-- 1. Add points column to tasks if it doesn't exist
alter table public.tasks add column if not exists points integer not null default 5;

-- 2. Drop and recreate the profiles RLS policy so ALL authenticated
--    users can read all profiles (needed for member lists in task modal)
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
drop policy if exists "profiles_select_self_or_admin" on public.profiles;
drop policy if exists "profiles_readable_by_authenticated" on public.profiles;
create policy "profiles_readable_by_authenticated"
  on public.profiles for select
  using (auth.uid() is not null);

-- 3. Allow members to update their own tasks (accept, submit for review)
drop policy if exists "tasks_admin_update_or_assignee_progress" on public.tasks;
create policy "tasks_admin_update_or_assignee_progress"
  on public.tasks for update
  using (
    -- Admin can update any task in their project
    exists (
      select 1 from public.projects p
      where p.id = tasks.project_id and p.owner_id = auth.uid()
    )
    or
    -- Assignee can update their own task
    tasks.assignee_id = auth.uid()
  )
  with check (
    exists (
      select 1 from public.projects p
      where p.id = tasks.project_id and p.owner_id = auth.uid()
    )
    or tasks.assignee_id = auth.uid()
  );

-- 4. Allow admin to insert into task_reviews
drop policy if exists "task_reviews_admin_only" on public.task_reviews;
create policy "task_reviews_admin_only"
  on public.task_reviews for all
  using (
    exists (
      select 1
      from public.tasks t
      join public.projects p on p.id = t.project_id
      where t.id = task_reviews.task_id
        and p.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.tasks t
      join public.projects p on p.id = t.project_id
      where t.id = task_reviews.task_id
        and p.owner_id = auth.uid()
    )
  );

-- 5. Fix project_members policy — eliminate infinite recursion!
--    The old policy checked projects, which checked project_members.
drop policy if exists "project_members_visible_to_project" on public.project_members;
drop policy if exists "project_members_admin_manage" on public.project_members;
drop policy if exists "project_members_select" on public.project_members;
drop policy if exists "project_members_manage" on public.project_members;

-- Everyone authenticated can read members (safe & simple, breaks recursion)
create policy "project_members_select"
  on public.project_members for select
  using (auth.uid() is not null);

-- Only admins (project owners) can manage members.
-- We check the profiles table role instead of projects table to avoid recursion.
create policy "project_members_manage"
  on public.project_members for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 6. Fix projects delete policy (was missing)
drop policy if exists "projects_delete_admin_only" on public.projects;
create policy "projects_delete_admin_only"
  on public.projects for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- 7. DB safety net: auto-insert project owner into project_members on project create.
--    This ensures the project is ALWAYS visible to the admin even if the
--    frontend member-linking step partially fails.
create or replace function public.handle_new_project()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.project_members (project_id, profile_id, project_role)
  values (new.id, new.owner_id, 'admin')
  on conflict (project_id, profile_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_project_created on public.projects;
create trigger on_project_created
  after insert on public.projects
  for each row execute function public.handle_new_project();

-- Done!
