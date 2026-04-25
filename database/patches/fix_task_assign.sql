-- Fix: Automatically add task assignee to project_members to ensure they can see the project

create or replace function public.auto_link_task_assignee()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role workspace_role;
begin
  -- Get the profile role of the assignee
  select role into v_role from public.profiles where id = new.assignee_id;
  
  -- Insert into project_members
  insert into public.project_members (project_id, profile_id, project_role)
  values (new.project_id, new.assignee_id, coalesce(v_role, 'member'::workspace_role))
  on conflict (project_id, profile_id) do nothing;
  
  return new;
end;
$$;

drop trigger if exists on_task_assigned on public.tasks;
create trigger on_task_assigned
after insert or update of assignee_id on public.tasks
for each row execute function public.auto_link_task_assignee();

-- BACKFILL: Fix any existing tasks that were assigned to members who aren't in the project yet
insert into public.project_members (project_id, profile_id, project_role)
select distinct t.project_id, t.assignee_id, coalesce(p.role, 'member'::workspace_role)
from public.tasks t
join public.profiles p on p.id = t.assignee_id
where not exists (
  select 1 from public.project_members pm 
  where pm.project_id = t.project_id and pm.profile_id = t.assignee_id
)
on conflict (project_id, profile_id) do nothing;
