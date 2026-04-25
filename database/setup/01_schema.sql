-- Shared bootstrap for the KPIT task workflow schema.
-- Run this first, then execute the feature-specific SQL files.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'workspace_role') then
    create type workspace_role as enum ('admin', 'member');
  end if;

  if not exists (select 1 from pg_type where typname = 'project_status') then
    create type project_status as enum ('active', 'on_hold', 'completed', 'archived');
  end if;

  if not exists (select 1 from pg_type where typname = 'story_status') then
    create type story_status as enum ('backlog', 'in_progress', 'review', 'done');
  end if;

  if not exists (select 1 from pg_type where typname = 'task_priority') then
    create type task_priority as enum ('low', 'medium', 'high');
  end if;

  if not exists (select 1 from pg_type where typname = 'task_status') then
    create type task_status as enum ('todo', 'in_progress', 'in_review', 'done');
  end if;

  if not exists (select 1 from pg_type where typname = 'review_decision') then
    create type review_decision as enum ('approved', 'changes_requested');
  end if;

  if not exists (select 1 from pg_type where typname = 'notification_type') then
    create type notification_type as enum ('project', 'member', 'story', 'task', 'review');
  end if;
end $$;
