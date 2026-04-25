-- User stories live inside a project board.

create table if not exists public.user_stories (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text not null default '',
  status story_status not null default 'backlog',
  story_points integer not null default 0 check (story_points >= 0),
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists user_stories_set_updated_at on public.user_stories;
create trigger user_stories_set_updated_at
before update on public.user_stories
for each row execute function public.handle_profile_updated_at();
