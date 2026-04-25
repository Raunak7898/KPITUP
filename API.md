# KPIT Task Workflow - API Documentation

The application interacts with Supabase via the `@supabase/supabase-js` client. There is no traditional REST API; instead, the frontend performs direct CRUD operations filtered by RLS policies.

## Authentication

### Login
Uses Supabase Auth `signInWithPassword`.
- **Admin Email**: `raunak789805@gmail.com`
- **Default Password**: `Raunak@7898`

### Signup
Uses `signUp`. Triggers a profile creation in the database.

## Database Operations (Store Actions)

### Projects
- `fetchProjects()`:
  - **Method**: `GET`
  - **Table**: `projects`
  - **Joins**: `project_members`, `tasks`, `profiles`
  - **Filtering**: Automatically filtered by RLS (only shows projects where the user is a member or owner).

- `addProject(input)`:
  - **Method**: `INSERT`
  - **Table**: `projects`
  - **Logic**: Creates the project, then triggers a member linking loop for the workspace.

### Tasks
- `addTask(taskInput)`:
  - **Method**: `INSERT`
  - **Table**: `tasks`
  - **Initial Status**: `todo`

- `acceptTask(taskId)`:
  - **Method**: `UPDATE`
  - **Table**: `tasks`
  - **Status Change**: `todo` -> `in_progress`
  - **Auth**: Only the assigned `assignee_id` can perform this.

- `submitTaskForReview(taskId)`:
  - **Method**: `UPDATE`
  - **Table**: `tasks`
  - **Status Change**: `in_progress` -> `in_review`

- `reviewTask(taskId, decision, comment)`:
  - **Method**: `UPDATE` (tasks) + `INSERT` (task_reviews)
  - **Status Change**: `in_review` -> `done` (Approve) OR `in_review` -> `in_progress` (Reject)
  - **Auth**: Only the project owner (Admin) can perform this.

## Real-time Notifications
The system uses the `notifications` array in the Zustand store. Notifications are triggered locally after successful Supabase mutations to provide immediate feedback to the current user.
