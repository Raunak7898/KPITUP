-- Calendar deadline assignments for project members.

create table if not exists public.project_deadlines (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  member_id uuid not null references public.profiles(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete restrict,
  title text not null,
  note text,
  due_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists project_deadlines_project_due_idx
  on public.project_deadlines (project_id, due_date);

create index if not exists project_deadlines_member_due_idx
  on public.project_deadlines (member_id, due_date);

drop trigger if exists project_deadlines_set_updated_at on public.project_deadlines;
create trigger project_deadlines_set_updated_at
before update on public.project_deadlines
for each row execute function public.handle_profile_updated_at();

alter table public.project_deadlines enable row level security;

drop policy if exists "project_deadlines_visible_to_admin_or_member" on public.project_deadlines;
create policy "project_deadlines_visible_to_admin_or_member"
on public.project_deadlines
for select
using (
  member_id = auth.uid()
  or exists (
    select 1
    from public.projects p
    where p.id = project_deadlines.project_id
      and p.owner_id = auth.uid()
  )
);

drop policy if exists "project_deadlines_admin_manage" on public.project_deadlines;
create policy "project_deadlines_admin_manage"
on public.project_deadlines
for all
using (
  exists (
    select 1
    from public.projects p
    where p.id = project_deadlines.project_id
      and p.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.projects p
    where p.id = project_deadlines.project_id
      and p.owner_id = auth.uid()
  )
);
