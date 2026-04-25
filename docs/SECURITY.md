# Security Architecture & RLS Audit

Security in KPIT Task Workflow is not a feature; it is an architectural foundation. We utilize a "Zero Trust" approach where the database protects itself regardless of client-side inputs.

## 🧱 Row Level Security (RLS) Deep-Dive

### 1. The Membership Paradox (Recursion Avoidance)
A common pitfall in project management apps is recursive policies (checking project membership to grant access to the membership table itself). 
- **Solution**: We broke this cycle by allowing authenticated users to see all profiles, and then granting `SELECT` access to `project_members` based on a simple `auth.uid() is not null` check. This prevents Postgres from entering an infinite loop while maintaining data visibility for team collaboration.

### 2. Role-Based Access Control (RBAC)
We differentiate between `admin` and `member` roles using a custom Postgres Enum:
- **Admins**: Can perform `INSERT` on `projects`, `tasks`, and `user_stories`. They have `DELETE` permissions on `projects`.
- **Members**: Can only `UPDATE` tasks assigned to them, and only specifically to move them through the workflow states (`todo` → `in_progress` → `in_review`).

## 🛡 Vulnerability Mitigation

### SQL Injection
The use of the PostgREST interface via the Supabase client inherently prevents SQL injection by treating all inputs as data parameters rather than executable code.

### XSS (Cross-Site Scripting)
React's virtual DOM automatically escapes dynamic content. For sensitive areas (like task descriptions), we recommend using a sanitization library if HTML rendering is ever enabled.

### Unauthorized Data Access
Because of our RLS policies, a user cannot simply change a `project_id` in a request and see data from a different workspace. The database will return an empty set or a permission error.

## 📋 Security Checklist

- [x] RLS enabled on all tables.
- [x] Admin role locked behind backend trigger logic.
- [x] No sensitive keys exposed (only `anon_key` is public).
- [x] Passwords managed by Supabase Auth (Argon2 hashing).
- [x] Database-level timestamps for all mutations.
