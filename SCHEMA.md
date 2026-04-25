# KPIT Task Workflow - Database Schema

This document describes the PostgreSQL schema used in the Supabase backend.

## Tables

### 1. `profiles`
Stores user profile information. Created automatically via trigger on signup.
- `id`: UUID (Primary Key, references auth.users)
- `email`: TEXT (Unique)
- `full_name`: TEXT
- `avatar_url`: TEXT
- `role`: workspace_role (Enum: 'admin', 'member')
- `title`: TEXT (Default: 'Contributor')
- `total_points`: INTEGER (Default: 0)
- `is_online`: BOOLEAN
- `updated_at`: TIMESTAMPTZ

### 2. `projects`
Stores project boards.
- `id`: UUID (Primary Key)
- `name`: TEXT (Required)
- `description`: TEXT
- `owner_id`: UUID (References profiles)
- `owner_email`: TEXT
- `due_date`: DATE
- `created_at`: TIMESTAMPTZ

### 3. `project_members`
Junction table for project assignments.
- `project_id`: UUID (References projects)
- `profile_id`: UUID (References profiles)
- `project_role`: TEXT
- **Unique Constraint**: (project_id, profile_id)

### 4. `tasks`
Core task data with workflow status.
- `id`: UUID (Primary Key)
- `project_id`: UUID (References projects)
- `story_id`: UUID (References user_stories)
- `title`: TEXT
- `description`: TEXT
- `priority`: task_priority (Enum: 'low', 'medium', 'high')
- `status`: task_status (Enum: 'todo', 'in_progress', 'in_review', 'done')
- `points`: INTEGER (Default: 5)
- `assignee_id`: UUID (References profiles)
- `created_by`: UUID (References profiles)
- `due_date`: DATE
- `accepted_at`: TIMESTAMPTZ
- `submitted_at`: TIMESTAMPTZ
- `reviewed_at`: TIMESTAMPTZ

### 5. `task_reviews`
Stores historical data for task reviews (approvals/rejections).
- `id`: UUID (Primary Key)
- `task_id`: UUID (References tasks)
- `reviewer_id`: UUID (References profiles)
- `decision`: review_decision (Enum: 'approve', 'reject')
- `comment`: TEXT
- `reviewed_at`: TIMESTAMPTZ

## Custom Types (Enums)

- `workspace_role`: `('admin', 'member')`
- `task_priority`: `('low', 'medium', 'high')`
- `task_status`: `('todo', 'in_progress', 'in_review', 'done')`
- `review_decision`: `('approve', 'reject')`

## Triggers & Functions

- **`handle_new_user`**: Automatically inserts a row into `profiles` whenever a new user confirms their email in Supabase Auth. It also handles assigning the 'admin' role to a specific hardcoded email.
- **`handle_new_project`**: Automatically adds the project creator (admin) to the `project_members` table as an admin.
- **`enforce_task_workflow`**: (Optional logic) Ensures tasks follow the correct state transition (e.g., cannot move from `todo` straight to `done` without `in_progress`).
