# KPIT Task Workflow - Security Considerations

Security in this application is handled at two levels: **Identity Management** (Auth) and **Data Authorization** (RLS).

## Identity & Authentication
- **Supabase Auth**: All users must be authenticated via email and password.
- **JWT Tokens**: Every request to Supabase includes a JWT that identifies the user.
- **Profile Roles**: The `profiles` table stores a `role` ('admin' or 'member'). This role is set at the database level and cannot be changed by the user via the frontend.

## Row Level Security (RLS)

RLS is enabled on every table to prevent unauthorized access even if the frontend is manipulated.

### Table Policies:

| Table | Policy Type | Rule |
| :--- | :--- | :--- |
| **profiles** | SELECT | Any authenticated user can read all profiles (required for member list). |
| **profiles** | UPDATE | Users can only update their own profile (e.g., avatar, bio). |
| **projects** | SELECT | Users can see projects they own OR projects where they are listed in `project_members`. |
| **projects** | INSERT | Only users with `role = 'admin'` in their profile can create projects. |
| **tasks** | SELECT | Users can see tasks belonging to projects they have access to. |
| **tasks** | UPDATE | Admins can update any task; Members can ONLY update status if they are the `assignee_id`. |
| **task_reviews** | INSERT | Only project owners can insert a review record. |

## Data Integrity
- **Database Triggers**: Used to enforce the workflow (e.g., setting `accepted_at` when status changes to `in_progress`).
- **Cascade Deletes**: Deleting a project automatically wipes all associated tasks, members, and stories to prevent orphaned data.

## Vulnerability Prevention
- **SQL Injection**: Prevented by using the Supabase PostgREST client, which uses parameterized queries.
- **XSS**: React automatically escapes data in the DOM. Custom CSS is used for styling, avoiding the inclusion of unsafe third-party script tags.
- **Recursion Fix**: All RLS policies have been audited and fixed to avoid infinite recursion loops by simplifying the selection logic.
