-- RLS policies for admin-controlled project and task flow.

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.user_stories enable row level security;
alter table public.tasks enable row level security;
alter table public.task_reviews enable row level security;
alter table public.notifications enable row level security;
alter table public.activity_log enable row level security;

drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin"
on public.profiles
for select
using (
  auth.uid() = id
  or exists (
    select 1 from public.profiles as p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

drop policy if exists "projects_visible_to_members" on public.projects;
create policy "projects_visible_to_members"
on public.projects
for select
using (
  exists (
    select 1
    from public.project_members pm
    where pm.project_id = projects.id
      and pm.profile_id = auth.uid()
  )
);

drop policy if exists "projects_insert_admin_only" on public.projects;
create policy "projects_insert_admin_only"
on public.projects
for insert
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and lower(p.email) = 'raunak789805@gmail.com'
  )
);

drop policy if exists "projects_update_admin_only" on public.projects;
create policy "projects_update_admin_only"
on public.projects
for update
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and lower(p.email) = 'raunak789805@gmail.com'
  )
);

drop policy if exists "project_members_visible_to_project" on public.project_members;
create policy "project_members_visible_to_project"
on public.project_members
for select
using (
  exists (
    select 1
    from public.project_members pm
    where pm.project_id = project_members.project_id
      and pm.profile_id = auth.uid()
  )
);

drop policy if exists "project_members_admin_manage" on public.project_members;
create policy "project_members_admin_manage"
on public.project_members
for all
using (
  exists (
    select 1 from public.projects p
    where p.id = project_members.project_id
      and p.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.projects p
    where p.id = project_members.project_id
      and p.owner_id = auth.uid()
  )
);

drop policy if exists "stories_visible_to_project_members" on public.user_stories;
create policy "stories_visible_to_project_members"
on public.user_stories
for select
using (
  exists (
    select 1 from public.project_members pm
    where pm.project_id = user_stories.project_id
      and pm.profile_id = auth.uid()
  )
);

drop policy if exists "stories_admin_manage" on public.user_stories;
create policy "stories_admin_manage"
on public.user_stories
for all
using (
  exists (
    select 1 from public.projects p
    where p.id = user_stories.project_id
      and p.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.projects p
    where p.id = user_stories.project_id
      and p.owner_id = auth.uid()
  )
);

drop policy if exists "tasks_visible_to_project_members" on public.tasks;
create policy "tasks_visible_to_project_members"
on public.tasks
for select
using (
  exists (
    select 1 from public.project_members pm
    where pm.project_id = tasks.project_id
      and pm.profile_id = auth.uid()
  )
);

drop policy if exists "tasks_admin_insert" on public.tasks;
create policy "tasks_admin_insert"
on public.tasks
for insert
with check (
  exists (
    select 1 from public.projects p
    where p.id = tasks.project_id
      and p.owner_id = auth.uid()
  )
);

drop policy if exists "tasks_admin_update_or_assignee_progress" on public.tasks;
create policy "tasks_admin_update_or_assignee_progress"
on public.tasks
for update
using (
  exists (
    select 1 from public.projects p
    where p.id = tasks.project_id
      and p.owner_id = auth.uid()
  )
  or tasks.assignee_id = auth.uid()
)
with check (
  exists (
    select 1 from public.projects p
    where p.id = tasks.project_id
      and p.owner_id = auth.uid()
  )
  or tasks.assignee_id = auth.uid()
);

drop policy if exists "task_reviews_visible_to_project_members" on public.task_reviews;
create policy "task_reviews_visible_to_project_members"
on public.task_reviews
for select
using (
  exists (
    select 1
    from public.tasks t
    join public.project_members pm on pm.project_id = t.project_id
    where t.id = task_reviews.task_id
      and pm.profile_id = auth.uid()
  )
);

drop policy if exists "task_reviews_admin_only" on public.task_reviews;
create policy "task_reviews_admin_only"
on public.task_reviews
for all
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

drop policy if exists "notifications_visible_to_recipient" on public.notifications;
create policy "notifications_visible_to_recipient"
on public.notifications
for select
using (profile_id = auth.uid());

drop policy if exists "notifications_insert_admin_or_system" on public.notifications;
create policy "notifications_insert_admin_or_system"
on public.notifications
for insert
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

drop policy if exists "activity_visible_to_project_members" on public.activity_log;
create policy "activity_visible_to_project_members"
on public.activity_log
for select
using (
  exists (
    select 1 from public.project_members pm
    where pm.project_id = activity_log.project_id
      and pm.profile_id = auth.uid()
  )
);
