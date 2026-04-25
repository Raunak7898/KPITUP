-- Task assignment lifecycle:
-- admin creates in todo
-- assignee accepts -> in_progress
-- assignee submits -> in_review
-- admin approves -> done
-- admin rejects -> in_progress

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  story_id uuid references public.user_stories(id) on delete set null,
  title text not null,
  description text not null default '',
  priority task_priority not null default 'medium',
  status task_status not null default 'todo',
  points integer not null default 5,
  assignee_id uuid not null references public.profiles(id) on delete restrict,
  created_by uuid not null references public.profiles(id) on delete restrict,
  due_date date,
  accepted_at timestamptz,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.task_reviews (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null unique references public.tasks(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete restrict,
  decision review_decision not null,
  comment text,
  reviewed_at timestamptz not null default now()
);

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
before update on public.tasks
for each row execute function public.handle_profile_updated_at();

create or replace function public.enforce_task_workflow()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    if new.status <> 'todo' then
      raise exception 'new tasks must start in todo';
    end if;
    return new;
  end if;

  if old.status = 'todo' and new.status = 'in_progress' then
    new.accepted_at = coalesce(new.accepted_at, now());
    return new;
  end if;

  if old.status = 'in_progress' and new.status = 'in_review' then
    new.submitted_at = coalesce(new.submitted_at, now());
    return new;
  end if;

  if old.status = 'in_review' and new.status in ('done', 'in_progress') then
    new.reviewed_at = coalesce(new.reviewed_at, now());
    return new;
  end if;

  if new.status = old.status then
    return new;
  end if;

  raise exception 'invalid task workflow transition from % to %', old.status, new.status;
end;
$$;

drop trigger if exists tasks_enforce_workflow on public.tasks;
create trigger tasks_enforce_workflow
before insert or update on public.tasks
for each row execute function public.enforce_task_workflow();
