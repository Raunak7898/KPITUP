-- Projects and project membership.

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  status project_status not null default 'active',
  owner_id uuid not null references public.profiles(id) on delete restrict,
  owner_email text not null,
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  project_role workspace_role not null default 'member',
  joined_at timestamptz not null default now(),
  unique (project_id, profile_id)
);

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.handle_profile_updated_at();
