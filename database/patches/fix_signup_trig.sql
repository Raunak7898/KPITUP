-- Run this in Supabase SQL Editor to fix the signup trigger

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role workspace_role;
begin
  -- Determine role
  if lower(new.email) = 'raunak789805@gmail.com' then
    v_role := 'admin'::workspace_role;
  else
    v_role := 'member'::workspace_role;
  end if;

  -- CRITICAL FIX for testing environments:
  -- If you deleted a user from auth.users but their profile remained (e.g., cascade failed or was missing),
  -- the unique constraint on email will cause a "Database error saving new user".
  -- This safely removes the orphaned profile so the new signup can succeed.
  delete from public.profiles where email = new.email and id != new.id;

  -- Insert profile
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    v_role
  )
  on conflict (id) do update
    set
      email = excluded.email,
      full_name = coalesce(excluded.full_name, profiles.full_name),
      role = case
        when lower(excluded.email) = 'raunak789805@gmail.com' then 'admin'::workspace_role
        else profiles.role
      end;
      
  return new;
end;
$$;
